var crypto = require("crypto");

// the salt for the md5-authentication, could very well be any hex-string
// of this length – but security is not our concern as long as it's broken.
var SNONCE = "d7eda40e374e8a34ee97554ebbfea0b5";

function md5HexDigest(data) {
    var string = new Buffer(data, "hex"),
        hash = crypto.createHash("md5");

    hash.update(string);

    return hash.digest("hex");
}

module.exports = function(config) {
    var soapActionHandlers = {
        'urn:StartSession' : function __startSessionAction(req, res) {
            var reqData = req.soap.data["SOAP-ENV:Body"]["ns1:StartSession"],
                cardConfig = config.cards[reqData.macaddress];

            if (!cardConfig) {
                console.error('unknown card: mac-address ' + reqData.macaddress);
                res.end();

                return;
            }

            var credential = md5HexDigest(reqData.macaddress + reqData.cnonce + cardConfig.uploadKey);

            res.render('startSession', {
                "credential" : credential,
                "snonce" : SNONCE,
                "transfermodetimestamp" : reqData.transfermodetimestamp
            });
        },

        'urn:GetPhotoStatus' : function __getPhotoStatusAction(req, res) {
            // this should obviously reply if the image was already uploaded,
            // but it's not actually required for all this to work
            res.render('getPhotoStatus');
        },

        'urn:MarkLastPhotoInRoll' : function __markLastPhotoInRollAction(req, res) {
            // yeah, whatever. According to http://goo.gl/DmD4b this might be useful when
            // multiple files are uploaded in parallel.
            res.render('markLastPhotoInRoll');
        }
    };

    return function __handleSoapRequest(req, res) {
        var handler = soapActionHandlers[req.soap.action];

        if(!handler) {
            console.error("unknown soap-action: " + req.soap.action);
            res.end();

            return;
        }

        return handler(req, res);
    }
};