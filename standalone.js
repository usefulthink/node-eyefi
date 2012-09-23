"use strict";

var fs = require('fs'),
    path = require('path'),
    eyefi = require('./lib/server'),
    Logger = require('devnull'),

    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

config.logger = new Logger({
    level: 6
});

var eyefiServer = eyefi(config).start();

config.logger.notice("eyefi-server started and listening");

eyefiServer.on('imageReceived', function(imgData) {
    config.logger.notice('received an image: ' + imgData.filename);
});