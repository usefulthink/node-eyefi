"use strict";

module.exports = function(config) {
    var logger = config.logger;

    if(!logger) {
        console.error("no logger defined. Won't log anything.");

        return function(req,res,next) { next(); };
    }

    return function(req, res, next) {
        if(req.soap) {
            logger.log('SOAP', req.originalUrl, '[' + req.soap.action + ']');
            logger.debug('SOAP', req.soap);
        }

        next();
    };
};