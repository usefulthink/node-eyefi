"use strict";

module.exports = function(config) {
    // uploads are handled by the middleware, so we're done here...
    return function __uploadHandler(req, res) {
        res.render('uploadSuccess');
    };
};