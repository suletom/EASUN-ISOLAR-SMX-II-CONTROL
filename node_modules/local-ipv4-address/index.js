var detectors = require('./detectors');
var os        = require('os');
var Q         = require('q');

var main = module.exports = function(){
    return Q().then(function(){
        var detector = detectors[os.platform()];
        if(detector){
            return detector.detectLocalIpV4Address();
        } else {
            throw new Error("Sorry, your operating system \"" + os.platform() + "\" is not supported. You are welcome to submit a pull request if you want.");
        }
    });
};

if(require.main === module){
    main()
        .then(function(ipAddress){
            console.log(ipAddress);
        }, function(err){
            console.error(err.message);
            process.exit(1);
        });
}