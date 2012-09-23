var config = require('../lib/config'),
    tar = require('tar'),
    fs = require('fs'),
    path = require('path');

// TODO: we need to emit an event when the file upload is complete.
//       Stick to the express-middleware conventions and make the router configurable.
// TODO: logging with console.log needs to be replaced

module.exports = function (req, res) {
    var obj = req.soap.data["SOAP-ENV:Body"]["ns1:UploadPhoto"],
        uploadPath = config.getUploadPath(obj.macaddress);

    fs.createReadStream(req.files.FILENAME.path)
        .pipe(tar.Parse())
        .on("error", function (err) {
            console.error("an error occurred while extracting uploaded data: " + err);
            res.end();
        })
        .on("entry", function (entry) {
            console.log('tar entry: ' + entry.props.path);

            var outfile = path.join(uploadPath, entry.props.path);
            entry.pipe(fs.createWriteStream(outfile));
            entry.on("end", function () {
                console.log('upload complete. file: ', outfile);
            });
        })
        .on("end", function () { res.render('uploadSuccess'); });
};