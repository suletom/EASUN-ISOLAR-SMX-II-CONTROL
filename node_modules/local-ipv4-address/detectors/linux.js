var childProcess = require('child_process');
var ifconfig     = require('./ifconfig');
var Q            = require('q');

var DEFAULT_GATEWAY_LINE_PATTERN = /\n0\.0\.0\.0.*?\s*(\w+?)\n/m;

module.exports.detectLocalIpV4Address = function(){
    return Q.nfcall(childProcess.execFile, "netstat", [
            "-r",
            "-n",
            "-A", "inet"
        ])
        .spread(function(stdout, stderr){
            var matches = stdout.match(DEFAULT_GATEWAY_LINE_PATTERN);
            if(matches){
                var interfaceName = matches[1];
                return interfaceName;
            } else {
                throw new Error("Could not find default gateway route in routing table.");
            }
        })
        .then(ifconfig.getIpV4AddressForInterface);
};