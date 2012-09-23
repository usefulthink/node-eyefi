var tar = require('tar'),
    fs = require('fs'),
    path = require('path');

// TODO: logging with console.log needs to be replaced

module.exports = function(config) {
    return function __uploadHandler(req, res) {
        var obj = req.soap.data["SOAP-ENV:Body"]["ns1:UploadPhoto"],
            uploadPath = config.uploadPath;

        fs.createReadStream(req.files.FILENAME.path)
            .pipe(tar.Parse())
            .on("error", function (err) {
                console.error("an error occurred while extracting uploaded data: " + err);
                res.end();
            })
            .on("entry", function (entry) {
                var outfile = path.join(uploadPath, entry.props.path);
                entry.pipe(fs.createWriteStream(outfile));
                entry.on("end", function () {
                    req.app.emit('imageReceived', { filename: outfile });
                });
            })
            .on("end", function () {
                res.render('uploadSuccess');
            });
    }
};