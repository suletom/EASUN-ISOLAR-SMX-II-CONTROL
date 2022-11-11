var childProcess = require('child_process');
var ifconfig     = require('./ifconfig');
var Q            = require('q');

var DEFAULT_GATEWAY_LINE_PATTERN = /Internet:[^]+?\n(default.*?\n)/m;

module.exports.detectLocalIpV4Address = function(){
    return Q.nfcall(childProcess.execFile, "netstat", [
            "-r",
            "-n",
            "-f", "inet"
        ])
        .spread(function(stdout, stderr){
            var matches = stdout.match(DEFAULT_GATEWAY_LINE_PATTERN);
            if(matches){
                var columns = matches[1].trim().split(/\s+/);
                var interfaceName = columns[columns.length-1];
                return interfaceName;
            } else {
                throw new Error("Could not find default gateway route in routing table.");
            }
        })
        .then(ifconfig.getIpV4AddressForInterface);
};