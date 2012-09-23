var express = require('express'),
    routes = require('../routes');

// TODO: we need to pass the config through to submodules, middleware etc.
// TODO: logging should be controlled via config
exports.createServer = function(config) {
    var app = express.createServer();

    // main configuration
    app.configure(function () {
        app.register('xml', require('ejs'));

        app.set('views', __dirname + '/../views');
        app.set('view engine', 'xml');
        app.set('view options', { layout: false });

        app.use(express.bodyParser())
            .use(express.methodOverride())
            .use(express.logger(require('./express.logFormatter')));

        // the cards do not set the soapaction-header when uploading files.
        app.use(function(req,res,next) {
            if(req.url == '/api/soap/eyefilm/v1/upload') {
                req.headers.soapaction = '"urn:UploadPhoto"';
            }

            next();
        });

        app.use(require('./express.soapParser'));
        app.use(app.router);
    });

    // Routing
    app.post('/api/soap/eyefilm/v1', routes.soap.handleSoapRequest);
    app.post('/api/soap/eyefilm/v1/upload', routes.upload);

    app.start = function() {
        this.listen(59278);

        return this;
    };

    return app;
};