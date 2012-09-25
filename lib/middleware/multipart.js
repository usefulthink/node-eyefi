/*!
 * adapted
 *
 * Connect - multipart
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

var formidable = require('formidable'),
    _limit = require('express').limit,

    qs = require('qs');

/**
 * noop middleware.
 */

function noop(req, res, next) { next(); }

function mime(req) {
    var str = req.headers['content-type'] || '';
    return str.split(';')[0];
};

exports = module.exports = function (options) {
    options = options || {};

    var limit = options.limit
        ? _limit(options.limit)
        : noop;

    return function multipart(req, res, next) {
        if (req._body) return next();

        req.body = req.body || {};
        req.files = req.files || {};

        // ignore GET
        if ('GET' == req.method || 'HEAD' == req.method) return next();

        // check Content-Type
        if ('multipart/form-data' != mime(req)) return next();

        // flag as parsed
        req._body = true;

        // parse
        limit(req, res, function (err) {
            if (err) return next(err);

            var form = new formidable.IncomingForm
                , data = {}
                , files = {}
                , done;

            Object.keys(options).forEach(function (key) {
                form[key] = options[key];
            });

            function ondata(name, val, data) {
                if (Array.isArray(data[name])) {
                    data[name].push(val);
                } else if (data[name]) {
                    data[name] = [data[name], val];
                } else {
                    data[name] = val;
                }
            }

            form.on('progress', function(bytesReceived, bytesExpected) {
                req.app.emit('uploadProgress', { received: bytesReceived, expected: bytesExpected });
            });

            form.on('field', function (name, val) {
                ondata(name, val, data);
            });

            form.on('file', function (name, val) {
                ondata(name, val, files);
            });

            form.on('error', function (err) {
                next(err);
                done = true;
            });

            form.on('end', function () {
                // next() already called by the error-event
                if (done) return;

                try {
                    req.body = qs.parse(data);
                    req.files = qs.parse(files);
                    next();
                } catch (err) {
                    next(err);
                }
            });

            form.parse(req);
        });
    }
};
