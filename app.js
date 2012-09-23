"use strict";

var fs = require('fs'),
    path = require('path'),
    eyefi = require('./lib/server'),

    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

var eyefiServer = eyefi.createServer(config).start();

console.log("node-eyefi started and listening");

eyefiServer.on('imageReceived', function(imgData) {
    console.log('received an image: ' + imgData.filename);
})