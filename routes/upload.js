var qs = require('querystring'),
    xml2js = require('xml2js'),
    config = require('../lib/config'),
    tar = require('tar'),
    fs = require('fs'),
    util = require('util'),
    path = require('path'),
    url = require('url');

var parser = new xml2js.Parser(xml2js.defaults["0.1"]);


/*
processes an upload-requests:

POST /api/soap/eyefilm/v1/upload
req.headers = {
  host: 'api.eye.fi',
  user-agent: 'Eye-Fi Card/5.0009',
  content-type: 'multipart/form-data; ...',
  content-length: nBytes
},
req.files.FILENAME: attached file is a tar-file containing a single file (?)

req.body.INTEGRITYDIGEST: i'd assume some kind of verification for the SOAP-Request, but don't know what kind of digest.
req.body.SOAPENVELOPE: the soap-message
*/


module.exports = function (req, res) {
    function renderUpload(err, data) {
        var obj = data["SOAP-ENV:Body"]["ns1:UploadPhoto"],
            cardConfig = config.getCardConfig(obj.macaddress);

        var uploadPath = config.getUploadPath(obj.macaddress);
        var uploadedFile = req.files.FILENAME;

        console.log(JSON.stringify(uploadedFile));

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
                    console.log("entry ended")
                });
            })
            .on("end", function () { res.render('uploadSuccess'); });
    };

    var decodedBody = decodeURIComponent(qs.stringify(qs.parse(req.body.SOAPENVELOPE)));
    parser.parseString(decodedBody, renderUpload);
};