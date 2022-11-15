let net = require('net');
let fs = require('fs');
let dgram = require('dgram');
var localIpV4Address = require("local-ipv4-address");
const { exit } = require('process');

var commads={};
fs.readFile('commands.json', (err, data) => {
    if (err) throw err;
    commads=JSON.parse(data);
});

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
            
            console.log("Sending UDP packet(port: "+port+") to inform datalogger device to connect the TCP server:");
            console.log(command);

            client.on('listening', function () {
                var address = client.address();
                console.log('UDP Server listening on ' + address.address + ":" + address.port);
            });

            client.on('error', (err) => {
                console.log(`server error:\n${err.stack}`);
                client.close();
            });
              

            client.on('message',function(message, remote){
                console.log(remote.address + ':' + remote.port +' - ' + message);
            });

            client.send(command,0, command.length, port, devip);
            
        });

    }catch(e){
        console.log(e);
    }

    
}

function starttcp(){

    let port=8899;

    console.log("starting TCP server(port: "+port+") to recieve data....");

    var server = net.createServer(function(socket) {

        console.log(`${socket.remoteAddress}:${socket.remotePort} Connected`);
        
        //socket.pipe(socket);
        socket.on('data',function(data){
            console.log("Got TCP packet...");
            dumpdata(data);
        });

        socket.on('error',function(error){
            console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
        });

        socket.on('close',function(){
            console.log(`${socket.remoteAddress}:${socket.remotePort} Connection closed`);
        });

        socket.write(getdatacmd('get_device_info'));

    });

    server.listen(port, '0.0.0.0');

}

function getdatacmd(data){

    console.log("command: "+data);

    let obj=commands.find(o => o.name === data );

    dumpdata(obj.cmd);

    return obj.cmd.toString('hex');
}

function dumpdata(data){

    let strdata=data.toString('hex');
    let out="";
    let i=1;
    data.forEach(element => {
        
        out+=element;
        if (i%2==0) {    
            out+=" ";
        }    
        i++;

    });

    console.log(out);

}


