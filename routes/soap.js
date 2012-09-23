var qs = require("querystring"),
    xml2js = require("xml2js"),
    config = require("../lib/config"),
    crypto = require("crypto");

var parser = new xml2js.Parser(xml2js.defaults["0.1"]);

// the salt for the md5-authentication, could very well be any hex-string
// of this length – but security is not our concern as long as it's broken.
var SNONCE = "d7eda40e374e8a34ee97554ebbfea0b5";

function md5HexDigest(data) {
    var string = new Buffer(data, "hex"),
        hash = crypto.createHash("md5");

    hash.update(string);

    return hash.digest("hex");
}

exports.handleSoapRequest = function (req, res) {
    var renderStartSessionResponse = function (data) {
        var reqData = data["SOAP-ENV:Body"]["ns1:StartSession"],
            cardConfig = config.getCardConfig(reqData.macaddress);

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
    };

    var renderGetPhotoStatusResponse = function (data) {
        // this should obviously reply if the image was already uploaded,
        // but it's not actually required for all this to work
        res.render('getPhotoStatus');
    };

    var renderMarkLastPhotoInRollResponse = function (data) {
        res.render('markLastPhotoInRoll');
    };

    /*
     * Decide what kind of SOAP request this was.
     */
    switch (req.soap.action) {
        case "urn:StartSession":
            renderStartSessionResponse(req.soap.data);
            break;
        case "urn:GetPhotoStatus":
            renderGetPhotoStatusResponse(req.soap.data);
            break;
        case "urn:MarkLastPhotoInRoll":
            renderMarkLastPhotoInRollResponse(req.soap.data);
            break;
        default:
            console.log("unknown soap-action: " + req.soap.action);
            req.end();
            break;
    }
};