var express = require('express'),
    routes = require('./routes'),
    soapParser = require('./middleware/soapParser'),
    logger = require('./middleware/logger'),
    multipart = require('./middleware/multipart.js');

exports = module.exports = createServer;

function createServer(config) {
    config = config || {};

    if(!config.logger) {
        // TODO: make logger configurable…
        var Logger = require('devnull');

        // default: only log warnings and above
        config.logger = new Logger({ level: 4 });
    }

    if(!config.cards) {
        config.logger.error("no cards were configured. Resuming might be a bit pointless.");
    }

    var app = express();

    // main configuration
    app.configure(function () {
        app.engine('xml', require('ejs').renderFile);

        app.set('views', __dirname + '/views');
        app.set('view engine', 'xml');
        app.set('view options', { layout: false });

        app.use(multipart());

        // the cards do not set the soapaction-header when uploading files.
        app.use(function(req,res,next) {
            if(req.url == '/api/soap/eyefilm/v1/upload') {
                req.headers.soapaction = '"urn:UploadPhoto"';
            }

            next();
        });

        app.use(soapParser(config));
        app.use(logger(config));
        app.use(app.router);
    });

    // Routing
    app.post('/api/soap/eyefilm/v1', routes.soapRequestHandler(config));
    app.post('/api/soap/eyefilm/v1/upload', routes.uploadHandler(config));

    app.start = function() {
        this.listen(59278);

        return this; // chaining-support
    };

    return app;
};