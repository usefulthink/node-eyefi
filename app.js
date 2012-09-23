var config = require('./lib/config'),
    eyefi = require('./lib/server');

var eyefiServer = eyefi.createServer(config).start();

console.log("node-eyefi started and listening");

eyefiServer.on('imageReceived', function(imgData) {
    console.log('received an image: ' + imgData.filename);
})