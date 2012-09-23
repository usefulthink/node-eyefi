"use strict";

var fs = require('fs'),
    path = require('path'),
    eyefi = require('./lib/server'),
    Logger = require('devnull'),

    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));


config.logger = new Logger({
    //level: 8 // log-level (8=debug)
});

var eyefiServer = eyefi.createServer(config).start();

console.log("node-eyefi started and listening");

eyefiServer.on('imageReceived', function(imgData) {
    config.logger.info('received an image: ' + imgData.filename);
});