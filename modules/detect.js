var os = require('os');
let dgram = require('dgram');
var Netmask = require('netmask').Netmask

const detect = function(callback){

    function tryport(dip,cb=null){
        
        console.log("Trying to detect datalogger on: ",dip);

        let client = dgram.createSocket('udp4');

        let timeout=setTimeout(function(){ try { client.close(); }catch(e) { console.log(e); } console.log("."); },2000);

        let port=58899;
        let ip="0.0.0.0";

        let command="set>server="+ip+":8899;";
                
        client.on('listening', function () {
            var address = client.address();
            console.log('UDP server listening on ' + address.address + ":" + address.port);
        });

        client.on('error', (err) => {
            console.log(`UDP error:\n${err.stack}`);
            client.close();
        });

        client.on('message',function(message, remote){
            console.log("Got answer, closing UDP socket...",message);
            if (cb!==null) cb(message);
            client.close();
        });

        client.send(command,0, command.length, port, dip);

    }


    let interfaces = os.networkInterfaces();
    //console.log(networkInterfaces);
    lnet=null;
    for (let devName in interfaces) {
        let iface = interfaces[devName];
    
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                    if (lnet==null) lnet=alias;
            }      
        }
    }

    if (lnet!==null){
        console.log("Found possible local net to scan on: ",lnet);
        
        block = new Netmask(lnet.cidr);

        ips=[];
        block.forEach(function(ip, long, index){
            ips.push(ip);
        });

        
        function processip(ind=0){
            for(i=ind;i<ips.length;i++){

                tryport(ips[i],callback);
                if (i==100){
                    setTimeout(function() { processip(i+1,2500,callback); });
                    return;
                }
            }
        }

        processip();

    }

}

exports.detect=detect;