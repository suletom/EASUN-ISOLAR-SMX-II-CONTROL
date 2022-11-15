let net = require('net');
let fs = require('fs');
let dgram = require('dgram');
var localIpV4Address = require("local-ipv4-address");
const { exit } = require('process');

var commands={};
fs.readFile('commands.json', (err, data) => {
    console.log(err);
    commands=JSON.parse(data);
});

var myargs = process.argv.slice(2);

console.log("!!! 0. Please connect to the datalogger wifi access point or ensure the device is accessible on your network !!!");

console.log("\nUSAGE: COMMAND [options]\n\nCOMMANDS:")
console.log("setip => set wifi datalogger network via wireless AP");
console.log("  required options: [datalogger ip address] [ssid] [password]");
console.log("connect => connect to datalogger via ip to send/recive MODBUS data");
console.log("  required options: [datalogger ip address]");

console.log("\n\n");

var commandsequence="";

if (myargs.length==0){
    console.log("\n No command supplied! ");
}else{
    if (myargs[0]=="setip"){
        if (myargs.length==4){
            
            commandsequence="setip";
            sendudp(myargs[1]);

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
                console.log('UDP server listening on ' + address.address + ":" + address.port);
            });

            client.on('error', (err) => {
                console.log(`UDP server error:\n${err.stack}`);
                client.close();
            });
              

            client.on('message',function(message, remote){
                console.log(remote.address + ':' + remote.port +' - ' + message);
            });

            client.send(command,0, command.length, port, devip);
            
        });

    }catch(e){
        console.log("Error: ",e);
    }

    
}

function starttcp(){

    let port=8899;
    let command_seq=0;

    console.log("starting TCP server(port: "+port+") to recieve data....");

    var server = net.createServer(function(socket) {

        console.log(`${socket.remoteAddress}:${socket.remotePort} connected on TCP`);
        
        //socket.pipe(socket);
        socket.on('data',function(data){
            console.log("Got TCP packet...");
            dumpdata(data);
            console.log("Binary: ",data.toString());

            let cmdstr=getcommseqcmd(command_seq);
            if (cmdstr === undefined) { console.log("DONE, exiting"); exit(0); }

            getdatacmd(cmdstr);
            //socket.write();
            
            });

        socket.on('error',function(error){
            console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
        });

        socket.on('close',function(){
            console.log(`${socket.remoteAddress}:${socket.remotePort} Connection closed`);
        });

        let cmdstr=getcommseqcmd(command_seq);
        if (cmdstr === undefined) { console.log("Missing command sequence, exiting..."); exit(0); }

        socket.write(getdatacmd(cmdstr));
        command_seq++;

    });

    server.listen(port, '0.0.0.0');

}

function getcommseqcmd(index){

    let obj=commands.commandsequences.find(o => o.name === commandsequence );
    return obj.seq[index];
}

function getdatacmd(data){

    console.log("Command: "+data);

    let obj=commands.commands.find(o => o.name === data );

    let i=0;
    myargs.forEach(function(el){
        obj.cmd.replace('{ARG'+i+'}',el);
    });
    
    dumpdata(obj.cmd);

    return Buffer.from(obj.cmd, 'hex');
}

function dumpdata(data){

    let strdata=data.toString('hex');
    
    let out="";
    let i=1;
    [...strdata].forEach(element => {
        
        out+=element;
        if (i%2==0) {     
            out+=" ";
        }    
        i++;

    });

    console.log(out);

}


