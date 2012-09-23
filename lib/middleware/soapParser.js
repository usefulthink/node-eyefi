var xml2js = require('xml2js'),
    parser = new xml2js.Parser(xml2js.defaults["0.1"]);

module.exports = function(config) {
    var logger = config.logger;

    return function __soapParser(req, res, next) {
        if(!req.headers.soapaction) {
            return next();
        }

        function xmlParsingComplete(err, data) {
            if(err) {
                logger.error('failed to parse xml-string ', err);

                return next();
            }

            req.soap.err = err;
            req.soap.data = data;

            return next();
        }

        req.soap = {};
        req.soap.action = req.headers.soapaction.slice(1,-1); // soap-action comes quoted

        // in case of file-uploads, the request was already handled by the bodyParser,
        // otherwise the buffer is still readable and we need to collect the data first…
        if(!req.readable) {
            logger.debug('parsing xml-string', req.body.SOAPENVELOPE);

            parser.parseString(req.body.SOAPENVELOPE, xmlParsingComplete);
        } else {
            var xmlBuffer = new Buffer(parseInt(req.headers['content-length'], 10));

            req.on('data', function(buf) { buf.copy(xmlBuffer); });
            req.on('end', function() {
                logger.debug('parsing xml-string', xmlBuffer.toString('utf-8'));

                parser.parseString(xmlBuffer.toString('utf-8'), xmlParsingComplete);
            });
        }
    };
};