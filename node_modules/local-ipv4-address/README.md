local-ipv4-address
===

Get the local network IPv4 address of the current computer based on the default gateway.

All of the other Node.js modules I found picked the address of the first or a random external interface from `os.networkInterfaces()` or performed a DNS lookup on the hostname. What if I have VMware virtual interfaces, an OpenVPN connection, wifi, an ethernet cable, and some loopback interfaces with convincing-looking hosts entries all connected?

Under the hood, it just executes `route.exe` or `netstat` and parses the output with regular expressions.

## Installation

```bash
$ npm install --save local-ipv4-address
```

## Usage

### In a Node module

```javascript
var localIpV4Address = require("local-ipv4-address");

localIpV4Address().then(function(ipAddress){
    console.log("My IP address is " + ipAddress);
    // My IP address is 10.4.4.137
});
```

### On the command line

```bash
$ node node_modules/local-ipv4-address
10.4.4.137
```

## Platform support

|Operating System|Versions tested|
|---|---|
|FreeBSD|11.0|
|Linux|Debian 8.7 Jessie|
|Mac OS|10.12.4 Sierra|
|Windows|7, Server 2016|


## What's not handled
- WAN address
- IPv6
- Multiple gateways
- Multi-homed connections
