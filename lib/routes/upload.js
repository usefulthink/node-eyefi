"use strict";

var tar = require('tar'),
    fs = require('fs'),
    path = require('path');

module.exports = function(config) {
    var logger = config.logger;

    return function __uploadHandler(req, res) {
        if(!req.soap || req.soap.err) {
            logger.error('error in request-data.');

            return res.end();
        }

        if(!req.files.FILENAME) {
            logger.error('missing uploaded file.');

            return res.end();
        }

        var reqData = req.soap.data["SOAP-ENV:Body"]["ns1:UploadPhoto"],
            uploadPath = config.uploadPath;

        logger.debug('got upload-request', reqData);

        fs.createReadStream(req.files.FILENAME.path)
            .pipe(tar.Parse())
            .on("error", function (err) {
                logger.error("an error occurred while extracting uploaded data: " + err);

                res.end();
            })
            .on("entry", function (entry) {
                var outfile = path.join(uploadPath, entry.props.path);
                entry.pipe(fs.createWriteStream(outfile));
                entry.on("end", function () {
                    logger.info('file extraction complete', outfile);

                    req.app.emit('imageReceived', { filename: outfile });
                });
            })
            .on("end", function () {
                logger.debug('sending upload-response');

                res.render('uploadSuccess');
            });
    };
};