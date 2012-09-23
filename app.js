try {
    process.setuid("node");
    process.setgid("node");
} catch (err) { console.log("Setting uid/gid failed"); }

var express = require('express'),
    routes = require('./routes'),
    formidable = require("formidable"),
    qs = require('querystring'),
    util = require('util'),
    config = require("./lib/config");

var app = module.exports = express.createServer();


app.configure(function () {
    app.register('xml', require('ejs'));

    app.set('views', __dirname + '/views');
    app.set('view engine', 'xml');
    app.set('view options', { layout: false });

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.logger(require('./lib/express.logFormatter.js')));

    app.use(require('./lib/express.soapParser'));

    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

// Routes
app.post('/api/soap/eyefilm/v1', routes.soap.handleSoapRequest);
app.post('/api/soap/eyefilm/v1/upload', routes.upload);

// Startup
app.listen(59278);
console.log("The Node-Eyefi Server was successfully started and is listening on port 59278.");