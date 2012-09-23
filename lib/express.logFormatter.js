var bytes = require('bytes');

module.exports = function(tokens, req, res){
    var status = res.statusCode
        , len = parseInt(res.getHeader('Content-Length'), 10)
        , color = 32;

    if (status >= 500) color = 31
    else if (status >= 400) color = 33
    else if (status >= 300) color = 36;

    len = isNaN(len)
        ? ''
        : len = ' - ' + bytes(len);

    return '\033[0m' + req.method
        + ' ' + req.originalUrl + ' ' + '(' + req.soap.action + ') '
        + '\033[' + color + 'm' + res.statusCode
        + ' \033[00m'
        + (new Date - req._startTime)
        + 'ms' + len
        + '\033[0m';
};