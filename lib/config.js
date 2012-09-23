var util = require('util'),
    fs = require('fs'),
    path = require('path'),

    config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));

module.exports = config;

module.exports.getCardConfig = function(macAddress) { return config.cards[macAddress]; };
module.exports.getUploadPath = function(macAddress) {
    var uploadPath = config.uploadPath,
        cc = config.cards[macAddress];

    if(cc.uploadPath) {
        uploadPath = cc.uploadPath;
    }

    return path.resolve(uploadPath);
};