let net = require('net');
let fs = require('fs');
let dgram = require('dgram');
var localIpV4Address = require("local-ipv4-address");
const { exit } = require('process');
const { Buffer } = require('buffer');
const { match } = require('assert');

var commands={};
let cdata=fs.readFileSync('commands.json',{encoding:'utf8', flag:'r'})

try{ 
    commands=JSON.parse(cdata);
}catch(e){
    console.log(e);
}

var myargs = process.argv.slice(2);

console.log("!!! 0. Please connect to the datalogger wifi access point or ensure the device is accessible on your network !!!");
console.log("!!! On initial setup the datalogger ip address is the gateway (obtained by dhcp from the datalogger wifi AP) !!!");

console.log("\nUSAGE: COMMAND [options]\n\nCOMMANDS:")
commands.commandsequences.forEach(function(cs){
    console.log(cs.name+" "+cs.args+" \n ("+cs.desc+")\n");
});

console.log("\n");

var commandsequence="";
var global_tcp_seq=1; //sends the device in every command: modbus transaction id

if (myargs.length==0){
    console.log("\n No command supplied! ");
}else{

    commands.commandsequences.forEach(function(cs){
        
        if (cs.name===myargs[0]){
            
            commandsequence=myargs[0];
            console.log("Running: "+commandsequence);

            argscount=[];
            cs.seq.forEach(function(cd){
                let nc=commands.commands.find(cdf => cdf.name === cd);
                
                let reg=nc.cmd.match(/\{ARG[0-9]+\}/g);
                if (reg!=null && reg!==false && reg!=undefined ) argscount=argscount.concat(reg);
                
            });
           
            var arguniq=argscount.filter((v, i, a) => a.indexOf(v) === i);
            
            if (myargs.length<arguniq.length+2) {
                console.log("Wrong number of arguments! Exiting...");
                exit(-1);
            }

            sendudp(myargs[1]);

        }

    });

}


function sendudp(devip){

    try{

        localIpV4Address().then(function(ip){
            
            console.log("Using local ip to create TCP server: "+(ip));

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
            console.log("\n");

            let lastcmdname=getcommseqcmd(command_seq-1);
            //console.log(lastcmdname);
            let lastcmddef = commands.commands.find(e => e.name === lastcmdname);
            //console.log(lastcmddef);
            if (lastcmddef!==undefined && lastcmddef!==null && lastcmddef.hasOwnProperty('definition')){
                
                let handled=[];

                lastcmddef.definition.forEach(function(def){
                    let val="";
                    if ( Number.isInteger(def.type) ){

                        //type with custom length
                        val=data.toString('hex');
                        val=val.substring(def.address*2,def.address*2+def.type);

                        //hack: mark onyl the first char: just for debugging
                        handled[def.address*2]=1
                       
                    }else{    
                        //basic types supported by Buffer class

                        val=data['read'+def.type](def.address);

                        //hack: mark always 4 bytes: just for debugging
                        handled[def.address*2]=1;
                        handled[def.address*2+1]=1;
                        handled[def.address*2+2]=1;
                        handled[def.address*2+3]=1;

                        val=val*def.rate;
                        val=val.toFixed(def.format);
                    }
                    console.log(def.name+":\t \t "+val+" "+(Array.isArray(def.unit)?def.unit[parseInt(val)]:def.unit));
                });

                console.log("\nHandled values: \n");
                dumpdata(data,handled);
            }

            let cmdstr=getcommseqcmd(command_seq);
            if (cmdstr === undefined) { console.log("DONE, exiting"); exit(0); }
               
            socket.write(getdatacmd(cmdstr));
            command_seq++;
            
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

//get next command for the commany sequence by index
function getcommseqcmd(index){

    let obj=commands.commandsequences.find(o => o.name === commandsequence );
    return obj.seq[index];
}

function getdatacmd(data){

    console.log("Command: "+data);

    let obj=commands.commands.find(o => o.name === data );

    //place input args in modbus commands
    let i=0;
    myargs.forEach(function(el){

        let hext=Buffer.from(el, 'utf8').toString('hex');
        if (obj.hasOwnProperty('raw') && obj.raw===true){
            hext=el;
        }
        obj.cmd=obj.cmd.replace('{ARG'+i+'}',hext);
        i++;
    });

    //custom built modbus command
    
    obj.cmd=handle_modbus_command(obj.cmd,getparam(myargs[myargs.length-1]));

    //compute and place length where needed
    let matches=obj.cmd.match(/\{LEN\}(.+)$/);
    if (matches) {
        obj.cmd=obj.cmd.replace("{LEN}",(matches[1].length/2).toString(16).padStart(4, '0'));
    }

    //add modbus tcp transaction id, just an incemental index
    obj.cmd=obj.cmd.replace('{SEQ}',String(global_tcp_seq).padStart(4, '0'));
    global_tcp_seq++;

    dumpdata(obj.cmd);
    
    return Buffer.from(obj.cmd, 'hex');
}

function getparam(ind){

    let param=commands.params.find(o => o.num === ind );
    if (param!==undefined) {
        console.log("Requested param: "+param.name);
        return param.address+"0001";
    }
    return "";    
    //reutrn"e2040001";

}

//hex dump
function dumpdata(data,handled=null){

    let strdata=data.toString('hex');
    
    let out="";
    let i=1;
    [...strdata].forEach(element => {
        
        bgred="\x1b[42m";
        normal="\x1b[0m";

        if (Array.isArray(handled)){
            if (handled[i-1]==1) {
                out+=bgred;
            }    
        }
        out+=element;
        if (Array.isArray(handled)){
            if (handled[i-1]==1) {
                out+=normal;
            }
        }    

        if (i%2==0) {     
            out+=" ";
        }

        if (i%16==0) {
            out+="  ";
        }

        if (i%32==0) {
            out+="\n";
        }

        i++;

    });

    console.log(out);

}

function handle_modbus_command(command,param){

    if (!command.match(/{CRC}/)) return command;

    command=command.replace('{PARAM}',param);
    
    let matches=command.match(/\{LEN\}[a-f0-9A-F]{4}(.+)\{CRC\}$/);
    let inner="";
    if (matches){
        //{CRC} -> 5 char vs 4char hex(2 byte): -1
        inner=Buffer.from(matches[1],'hex');
    }

    let crc=crc16modbus(inner);
    //console.log(crc);
    crc=crc.toString(16).padStart(4,'0');
    //console.log(crc);

    command=command.replace("{CRC}",crc.substring(2)+crc.substring(0,2));
    
    return command;

}

function crc16modbus(data){
    
    const table = [
        0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
        0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400
    ];
    
    let crc = 0xFFFF;

    for (let i = 0; i < data.length; i++) {
        let ch = data[i];
        crc = table[(ch ^ crc) & 15] ^ (crc >> 4);
        crc = table[((ch >> 4) ^ crc) & 15] ^ (crc >> 4);
    }

    return crc;
    
}