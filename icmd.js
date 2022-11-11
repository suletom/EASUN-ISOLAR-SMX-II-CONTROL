let net = require('net');
let fs = require('fs');
let dgram = require('dgram');
var localIpV4Address = require("local-ipv4-address");
const { exit } = require('process');


const myArgs = process.argv.slice(2);



console.log("!!! 0. Please connect to the datalogger wifi access point or ensure the device is accessible on your network !!!");

console.log("\nUSAGE: COMMAND [options]\n\nCOMMANDS:")
console.log("setip => set wifi datalogger network via wireless AP");
console.log("  required options: [datalogger ip address] [ssid] [password]");
console.log("connect => connect to datalogger via ip to send/recive MODBUS data");
console.log("  required options: [datalogger ip address]");

console.log("\n\n");

if (myArgs.length==0){
    console.log("\n No command supplied! ");
}else{
    if (myArgs[0]=="setip"){
        if (myArgs.length==4){
             
            sendudp(myArgs[1]);

        }else{
            console.log("\nWrong parameters: EXAMPLE: setip 192.168.88.88 mywifi wifipassword");
        }
    }
}




function sendudp(devip){

    try{

        localIpV4Address().then(function(ip){
            
            console.log("Using local ip to create TCP server: "+(ip)); // err may be 'No active network interface found.' 
            starttcp();

            var client = dgram.createSocket('udp4');
            let port=58899;
            let command="set>server="+ip+":8899;";
            
            console.log("Sending udp packet to inform datalogger device to connect the TCP server:");
            console.log(command);

            client.send(command,0, command.length, port, devip);
            client.on('message',function(msg, info){
                console.log(msg);
            });

            client.close();

        });

    }catch(e){
        console.log(e);
    }

    
}

function starttcp(){

    let port=8899;

    console.log("starting tcp server(port: "+port+") to recieve data....");

    var server = net.createServer(function(socket) {
        console.log("Got TCP data...");
        socket.write("\x00\x01\x00\x01\x00\x0a\xff\x01\x16\x0b\x0a\x16\x10\x2d\x01\x2c");
        socket.pipe(socket);
        socket.on('data',function(data){
            console.log(data.toString('hex'));
        })
    });

    server.listen(port, '0.0.0.0');

}


