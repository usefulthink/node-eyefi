// based on Connect.multipart-middleware, extended to handle tar-uploads
var formidable = require('formidable'),
    _limit = require('express').limit,
    tar = require('tar'),
    path = require('path'),
    fs = require('fs'),

    qs = require('qs');

function mime(req) {
    var str = req.headers['content-type'] || '';
    return str.split(';')[0];
};

exports = module.exports = function (config) {
    var logger = config.logger,
        uploadPath = config.uploadPath;

    return function multipart(req, res, next) {
        if (req._body) return next();

        req.body = req.body || {};

        // ignore GET, check Content-Type
        if ('GET' == req.method || 'HEAD' == req.method) return next();
        if ('multipart/form-data' != mime(req)) return next();

        // flag as parsed
        req._body = true;

        // parse
        var form = new formidable.IncomingForm, fields = {}, done;

        // file-uploads from eye-fi cards are always tar-files, so we may save a bit of
        // disk-roundtrips by parsing them right away…
        form.onPart = function(part) {
            if(!part.filename || part.mime !== 'application/x-tar') {
                return form.handlePart(part);
            }

            part.pipe(tar.Parse())
                .on('error', next)
                .on('entry', function __onTarEntry(entry) {
                    var outfile = path.join(uploadPath, entry.props.path);
                    entry.pipe(fs.createWriteStream(outfile));
                    entry.on('end', function __onTarEntryEnd() {
                        logger.log('file extraction complete', outfile);

                        process.nextTick(function() {
                            req.app.emit('imageReceived', {
                                filename: outfile
                            });
                        });
                    });
                });
        };

        form.on('progress', function(bytesReceived, bytesExpected) {
            process.nextTick(function() {
                req.app.emit('uploadProgress', { received: bytesReceived, expected: bytesExpected });
            });
        });

        form.on('field', function(name, val) {
            if (Array.isArray(fields[name])) {
                fields[name].push(val);
            } else if (fields[name]) {
                fields[name] = [fields[name], val];
            } else {
                fields[name] = val;
            }
        });

        form.on('error', function(err) {
            next(err);
            done = true;
        });

        form.on('end', function() {
            // next() already called by the error-event
            if (done) return;

            try {
                req.body = qs.parse(fields);

                next();
            } catch (err) {
                next(err);
            }
        });

        form.parse(req);
    }
};
