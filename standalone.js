"use strict";

var fs = require('fs'),
    path = require('path'),
    eyefi = require('./lib/server'),
    bytes = require('bytes'),
    Logger = require('devnull'),

    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

var logger = config.logger = new Logger({
    level: 9
});

var eyefiServer = eyefi(config).start();

logger.notice("eyefi-server started and listening");

eyefiServer.on('imageReceived', function __logImageReceived(imgData) {
    logger.notice('received an image: ' + imgData.filename);
});

var progressLoggingPaused = false;
eyefiServer.on('uploadProgress', function(progressData) {
    var br=progressData.received || 0,
        be=progressData.expected || 0,
        pct=(100*br/be).toFixed(2);

    if(!progressLoggingPaused  || br==be) {
        logger.metric('progress: ' + bytes(br) + ' of ' + bytes(be) + '(' + pct + '%)');

        progressLoggingPaused = true;
        setTimeout(function() { progressLoggingPaused=false; }, 100);
    }
});