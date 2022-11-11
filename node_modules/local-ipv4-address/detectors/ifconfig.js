var os = require('os');

module.exports.getIpV4AddressForInterface = function(interfaceName){
    var interface = os.networkInterfaces()[interfaceName];

    var ipv4Address = interface.filter(function(address){
        return address.family === "IPv4";
    })[0].address;

    return ipv4Address;
};