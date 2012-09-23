# Node-Eyefi

Allows an Eye-Fi card to post images directly to your node.js-application.

## Installation

### Standalone

    git clone git://github.com/usefulthink/node-eyefi.git
    cd node-eyefi && npm install .

### As a module

    npm install eyefi

## Preparations

 - you'll obviously need an Eye-Fi card. Amazon has these.
 - connect the eye-fi card to your computer and run the setup found on the card
   (on linux you might want to try Dave Hansen's eyefi-config found here:
   http://goo.gl/D3UVy)
 - the card should be configured to use your network with the TransferRelay
   mode (and any other fancy-pants feature) turned off
 - test it with the software provided.
 - make sure that the card is in the same network (and network-segment, i.e.
   can send packets to) as your computer.
 - close the eye-fi helper and manager.
 - Locate the `Settings.xml`-File (Windows: `\Users\<username>\Application Data\Eye-Fi\Settings.xml`,
   OS-X: `~/Library/Eye-Fi/Settings.xml`) to find out the cards mac-address and
   uploadKey


## Running standalone

    # create a file named config.json (just copy the config.json.sample)
    cp config.json.sample config.json
    
    # edit config.json and enter your cards mac-address and uploadKey
    
    # start the server
    node standalone.js

now take a photo to see if it's working.

## Integrate into your own project

Integration is possible, but currently not very feature-rich.
It basically just works (or maybe doesn't) and emits an
`imageReceived`-Event whenever the upload of an image is completed.

By default, logging will be quite verbose and print to the console. This is
something I'm working on.

    var eyefi = require('eyefi');
    
    var eyefiServer = eyefi({
        uploadPath : '/where/uploaded/files/are/stored',
        cards : {
            '<macaddress>': {
                uploadKey: '<uploadKey>'
            }
        }
    }).start();
    
    eyefiServer.on('imageReceived', function(data) {
        console.log('received an image: ' + data.filename);
    });


## Doesn't work?

Shit happens. [File an issue](https://github.com/usefulthink/node-eyefi/issues)
or [drop me a line](https://github.com/usefulthink). I'll see what I can do.


## Dive deeper?

If you want to undestand what is really going on behind the scenes, you could
start here:

 - http://code.google.com/p/sceye-fi - java-based eye-fi server
 - http://code.google.com/p/sceye-fi/wiki/UploadProtocol - a really good write-up on the soap-protocol
 - https://github.com/tachang/EyeFiServer - python-implementation, also some good docs
 - https://github.com/kristofg/rifec - perl, well documented


## Acknoledgements

Inspired by prior work of Sebastian Hoitz and Thomas Schaaf – their project
(http://goo.gl/HOxO2) gave me some insights and was some kind of starting-point
for me.

Also, thanks to all the people who dissected the eye-fi cards and the protocols.

