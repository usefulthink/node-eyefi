var xml2js = require('xml2js'),
    parser = new xml2js.Parser(xml2js.defaults["0.1"]);

/*
 - for all requests except the upload-request, SOAP-Payload is in the raw request-body
 - in case of the fileupload, the request has content-type multipart/form-data,
 the SOAP-Payload is in part named SOAPENVELOPE

 This is documented in detail here: http://code.google.com/p/sceye-fi/wiki/UploadProtocol
*/

module.exports = function __soapParser(req, res, next) {
    if(!req.headers.soapaction) {
        return next();
    }

    function xmlParsingComplete(err, data) {
        if(err) {
            console.err('failed to parse xml-string ', err);
            next();
        }

        req.soap.err = err;
        req.soap.data = data;

        next();
    }

    req.soap = {};
    req.soap.action = req.headers.soapaction.slice(1,-1); // soap-action comes quoted

    // in case of file-uploads, the request was already handled by the bodyParser,
    // otherwise the buffer is still readable and we need to collect the data first…
    if(req.readable) {
        var xmlBuffer = new Buffer(parseInt(req.headers['content-length'], 10));

        req.on('data', function(buf) { buf.copy(xmlBuffer); });
        req.on('end', function() {
            parser.parseString(xmlBuffer.toString('utf-8'), xmlParsingComplete);
        });
    } else {
        parser.parseString(req.body.SOAPENVELOPE, xmlParsingComplete);
    }
};
