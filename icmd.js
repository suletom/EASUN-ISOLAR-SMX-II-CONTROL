let net = require('net');
let fs = require('fs');
let dgram = require('dgram');
var localIpV4Address = require("local-ipv4-address");
const { exit } = require('process');
const { Buffer } = require('buffer');


function runscript(args) {

    var commands={};
    let cdata=fs.readFileSync(__dirname+'/commands.json',{encoding:'utf8', flag:'r'});

    try{ 
        commands=JSON.parse(cdata);
    }catch(e){
        console.log(e);
    }

    console.log("!!! 0. Please connect to the datalogger wifi access point or ensure the device is accessible on your network !!!");
    console.log("!!! On initial setup the datalogger ip address is the gateway (obtained by dhcp from the datalogger wifi AP) !!!");
    console.log("!!! Provide custom local ip if the machine that you are running this script from is available on a custom route not on the default one (vpn setup) !!!");

    console.log("Quick examples:\n Query all inverter parameters: npm start get-smx-param [datalogger ip address]");
    console.log(" Set output priority(parameter 1) to SOL: npm start set-smx-param [datalogger ip address] 1 SOL ");

    let customip="";
    let original_argv=args.slice();
    
    args.forEach(function(el, index, object){
        //console.log(el);
        let m=el.match(/^localip=((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/);
        if (m) {
            //if localip is provided before command -> error
            if (index==2) {
                console.log('Argument error: No COMMAND provided!');
                console.log("\nUSAGE: COMMAND [options] [localip=192.168.89.255]\n\nCOMMANDS:")
                commands.commandsequences.forEach(function(cs){
                    console.log(cs.name+" "+cs.args+" \n ("+cs.desc+")\n");
                });
                exit(-1);
            }
            customip=el.substring(8);
            console.log("")
            object.splice(index,1);
        }
    });
    
    var myargs = args.slice(2);

    console.log("\nUSAGE: COMMAND [options] [localip=192.168.89.255]\n\nCOMMANDS:")
    commands.commandsequences.forEach(function(cs){
        console.log(cs.name+" "+cs.args+" \n ("+cs.desc+")\n");
    });

    console.log("\n");

    var global_commandsequence=""; //run more commands after another
    var global_commandparam=""; //run more parameters for 1 command
    var grouped_commandparam=""; //run 1 query for multiple parameters
    var global_tcp_seq=1; //sends the device in every command: modbus transaction id

    if (myargs.length==0){
        console.log("\n No command supplied! ");
    }else{

        commands.commandsequences.forEach(function(cs){
            
            if (cs.name===myargs[0]){
                
                global_commandsequence=myargs[0];
                console.log("Running: "+global_commandsequence);

                argscount=[];
                cs.seq.forEach(function(cd){
                    let nc=commands.commands.find(cdf => cdf.name === cd);
                    
                    let reg=nc.cmd.match(/\{ARG[PV]*[0-9]+\}/g);
                    if (reg!=null && reg!==false && reg!=undefined ) argscount=argscount.concat(reg);

                    //console.log(nc);
                    if (nc.hasOwnProperty('definition') && Array.isArray(nc.definition)) {
                        //exit(0);
                        
                        //optional last argumentum (start param to query)
                        let lastarg=myargs[myargs.length-1];
                        let ind=nc.definition.findIndex(o => o.num == lastarg );

                        global_commandparam=(lastarg.match(/^[0-9]+$/) && ind>0 ?ind:0);

                        console.log("Starting from param: ",global_commandparam);

                        //check addresses to join to query together
                        let addrord=[];
                        nc.definition.forEach(function(el,ind){
                            
                            if (ind>=global_commandparam){

                                let addr=parseInt(el.address, 16);
                                
                                addrord.push({'index': ind,'address':addr, 'name': el.name,'type': (Number.isInteger(el.type)?el.type:1)});
                                
                            }
                        });

                        addrord.sort(function(a,b){ return a.address-b.address });

                        let bymem=[];
                        let lv=0;

                        addrord.forEach(function(el, ind){
                            if (bymem.length==0){
                                bymem.push([el]);
                            }else{

                                if (bymem[lv][0].address+123>(el.address+(Number.isInteger(el.type)?el.type:1))){
                                    bymem[lv].push(el);
                                }else{
                                    bymem.push([el]);
                                    lv++;
                                }

                            }
                        });
                        

                        //console.log("sortedaddrs:", bymem);
                        
                    }
                    
                });
            
                var arguniq=argscount.filter((v, i, a) => a.indexOf(v) === i);
                
                if (myargs.length<arguniq.length+2) {
                    console.log("Wrong number of arguments! Exiting...");
                    exit(-1);
                }

                //default 4 min timeout to prevent stucking node if not error event occures in tcp communication but no answer recived
                setTimeout(function() {
                    console.log("Timeout occured...exiting!");
                    exit(-1);
                }, (1000*60*4));

                sendudp(myargs[1]);

            }

        });

    }


    function sendudp(devip){

        try{

            localIpV4Address().then(function(ip){
            
                if (customip!=""){
                    ip=customip;
                }
                
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
                    console.log("Got answer, closing UDP socket...");
                    client.close();
                });

                client.send(command,0, command.length, port, devip);

            });

        }catch(e){
            console.log("Error: ",e);
            exit(-1);
        }
        
    }

    function starttcp(){

        let port=8899;
        let command_seq=0;

        console.log("starting TCP server(port: "+port+") to recieve data....");

        var server = net.createServer(function(socket) {

            console.log(`${socket.remoteAddress}:${socket.remotePort} connected on TCP`);
            
            let outsum="\n";
            let outobj={};

            //socket.pipe(socket);
            socket.on('data',function(data){
                //console.log("Got TCP packet...");
                //dumpdata(data);
                //console.log("Binary: ",data.toString());
                //console.log("\n");

                let lastcmdname=getcommseqcmd(command_seq-1);
                //console.log(lastcmdname);
                let lastcmddef = commands.commands.find(e => e.name === lastcmdname);
                //console.log(lastcmddef);
                if (global_commandparam!=="" && lastcmddef!==undefined && lastcmddef!==null && lastcmddef.hasOwnProperty('definition')){
                    
                    let handled=[];
                    lastcmddef.definition.forEach(function(def,ind){

                        if (global_commandparam!=="") {
                            if (ind!=global_commandparam) {
                                return ;
                            }
                        } else {
                            
                            return;
                        }

                        //modbus rtu response: fixed position to extract data from
                        let val="";
                        val=data.toString('hex');

                        process.stdout.write("Response orig:\n");
                        dumpdata(data);

                        //data starts at byte 11
                        startpos=11;

                        //1 byte len
                        lenval=data[10];
                        
                        let tmpbuf=data.slice(8,data.length-2);
                        let rcrc=data.slice(data.length-2,data.length);
                        //dumpdata(rcrc);
                        rcrc=rcrc.readUInt16BE().toString(16).padStart(4,'0');
                        //dumpdata(tmpbuf);
                        let chcrc=crc16modbus(tmpbuf);
                        chcrc=chcrc.toString(16).padStart(4,'0');
        
                        let hcrc=chcrc.substring(2)+chcrc.substring(0,2);
                        
                        console.log("(Response info len: "+lenval+" Data type: "+def.type+" "+"CRC check: "+hcrc+" "+rcrc+")");

                        if (hcrc!=rcrc){

                            let outt=(def.hasOwnProperty('num')?def.num.padStart(2,'0')+" ":"")+def.name+":\t \t NA : ERROR IN RESPONSE!";
                            console.log(outt);

                            outobj[def.name]="N/A";
                            outsum+=outt+"\n";

                        }else{

                            //custom formats
                            if ( Number.isInteger(def.type) ){

                                //type with custom length: not needed -> string default
                                //val=val.substring(startpos*2,startpos*2+(lenval*2));

                                for(let c=0;c<lenval*2;c++){
                                    handled[startpos*2+c]=1;
                                }
                                
                                //default handle as string
                                let nb=data.slice(startpos,startpos+lenval);
                                nb=nb.toString('utf8').replace(/\0/g, '');

                                if (def.hasOwnProperty('format')){
                                    //datetime
                                    if (def.format===100){
                                        nb= "20"+data.readUInt8(startpos+lenval-6).toString()+"-"+
                                            data.readUInt8(startpos+lenval-5).toString()+"-"+
                                            data.readUInt8(startpos+lenval-4).toString()+" "+
                                            data.readUInt8(startpos+lenval-3).toString().padStart(2,'0')+":"+
                                            data.readUInt8(startpos+lenval-2).toString().padStart(2,'0')+":"+
                                            data.readUInt8(startpos+lenval-1).toString().padStart(2,'0');
                                    }
                                    //fault codes
                                    if (def.format===101){
                                        nb = "FAULT0: "+data.readUInt16BE(startpos)+": "+def.unit[data.readUInt16BE(startpos)]+" "+
                                            "FAULT1: "+data.readUInt16BE(startpos+2)+": "+def.unit[data.readUInt16BE(startpos+2)]+" "+
                                            "FAULT2: "+data.readUInt16BE(startpos+4)+": "+def.unit[data.readUInt16BE(startpos+4)]+" "+
                                            "FAULT3: "+data.readUInt16BE(startpos+6)+": "+def.unit[data.readUInt16BE(startpos+6)]+" ";
                                            
                                    }
                                }
                                
                                val=nb;
                            
                            }else{

                                //basic types supported by Buffer class: most seem to be 2 bytes long
                                val=data['read'+def.type](startpos);

                                //hack: mark always 2 bytes: just for debugging
                                handled[startpos*2]=1;
                                handled[startpos*2+1]=1;
                                handled[startpos*2+2]=1;
                                handled[startpos*2+3]=1;

                                if (def.hasOwnProperty('rate')){
                                    val=val*def.rate;
                                }
                                
                                if (def.hasOwnProperty('format')){
                                    val=val.toFixed(def.format);
                                }
                                
                            }

                            let stmp=(def.hasOwnProperty('num')?def.num.padStart(2,'0')+" ":"")+def.name+":\t \t "+val+" "+(Array.isArray(def.unit)?( def.unit[parseInt(val)]!==undefined? (" => "+def.unit[parseInt(val)]): '' ):def.unit);
                            console.log(stmp);
                            outobj[def.name]=parseFloat(val);
                            if (Array.isArray(def.unit) && def.unit[parseInt(val)]!==undefined ) {
                                outobj[def.name+"_text"]=def.unit[parseInt(val)];
                            }
                            outsum+=stmp+"\n";
                            
                        }    

                        process.stdout.write("Response:\n");
                        dumpdata(data,handled);
                        
                    });

                    if (global_commandparam!=="" && lastcmddef.definition.length>global_commandparam+1){
                        global_commandparam++;
                        //run again with another param
                        command_seq--;
                    }
                }else{
                    process.stdout.write("Response:\n");

                    dumpdata(data);

                    console.log("String format:\n",data.toString());
                }

                let cmdstr=getcommseqcmd(command_seq);
                
                if (cmdstr === undefined) { 
                    console.log(outsum);
                    
                    if (Object.keys(outobj).length > 0 && outobj.constructor === Object) {
                        console.log("JSON output:\n",outobj);
                        try {
                            fs.writeFileSync('currentdata.json',JSON.stringify(outobj));
                        } catch (err) {
                            console.error(err)
                        }
                    }    
                    
                    console.log("DONE, exiting"); 
                    exit(0);
                }
                
                socket.write(getdatacmd(cmdstr));
                command_seq++;
                
            });

            socket.on('error',function(error){
                console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}..., exiting...`);
                exit(-1);
            });

            socket.on('close',function(){

                //this happens usually when the inverter drops the serial line
                //to force the datalogger to reconnect we need to restart it

                /*
                process.on("exit", function () {
                    console.log("process.onexit");
                    //hardcoded restart command
                    process.argv[2]="restart-wifi";
                    require("child_process").spawn(process.argv.shift(),process.argv, {
                        cwd: process.cwd(),
                        detached : true,
                        stdio: "inherit"
                    });
                });
                */

                console.log(`${socket.remoteAddress}:${socket.remotePort} Connection closed, exiting and trying to restart datalogger adapter...`);
                console.log("\n");

                //close tcp server
                server.close();

                original_argv[2]="restart-wifi";
                runscript(original_argv);
                
            });

            let cmdstr=getcommseqcmd(command_seq);
            if (cmdstr === undefined) { console.log("Missing command sequence, exiting..."); exit(-1); }

            
            let tw=getdatacmd(cmdstr);
            //console.log("write:",tw);
            socket.write(tw);
            command_seq++;

        });

        server.listen(port, '0.0.0.0');

    }


    //get next command for the commany sequence by index
    function getcommseqcmd(index){

        let obj=commands.commandsequences.find(o => o.name === global_commandsequence );
        return obj.seq[index];
    }

    function getdatacmd(data){

        console.log("\nCommand: "+data);

        let obj=commands.commands.find(o => o.name === data );
        //definition array link following
        if (typeof obj.definition === 'string'){
            obj.definition=commands.commands.find(o => o.name === obj.definition ).definition;
        }

        let cmdtorun=obj.cmd;
        //place simple input args in modbus commands
        let i=0;
        myargs.forEach(function(el){

            let hext=Buffer.from(el, 'utf8').toString('hex');
            if (obj.hasOwnProperty('raw') && obj.raw===true){
                hext=el;
            }
            cmdtorun=cmdtorun.replace('{ARG'+i+'}',hext);
            i++;
        });

        //custom built modbus command
        cmdtorun=handle_modbus_command(cmdtorun,obj);

        //compute and place length where needed
        let matches=cmdtorun.match(/\{LEN\}(.+)$/);
        if (matches) {
            cmdtorun=cmdtorun.replace("{LEN}",(matches[1].length/2).toString(16).padStart(4, '0'));
        }

        //add modbus tcp transaction id, just an incemental index
        cmdtorun=cmdtorun.replace('{SEQ}',String(global_tcp_seq).padStart(4, '0'));
        global_tcp_seq++;

        process.stdout.write("Request: ");
        dumpdata(cmdtorun);
        

        return Buffer.from(cmdtorun, 'hex');
    }

    function getparam(cmd,ind){

        let param=cmd.definition.find(o => o.num === ind );
        if (param!==undefined) {
            console.log("Requested param: "+param.name);
            return param;
        }
        return "";    
    }

    //hex dump with color highlighted terminal output
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

    function handle_modbus_command(command,cmd) {

        if (!command.match(/{CRC}/)) return command;
    
        let addr = "";
        let type = "";

        if (global_commandparam!==""){
            
            addr = cmd.definition[global_commandparam].address;
            type = cmd.definition[global_commandparam].type;
            console.log("Querying param: "+cmd.definition[global_commandparam].name+"\n");
            if (grouped_commandparam=="") {
                grouped_commandparam=0;
            }
        }
        
        //join queries
        
        //let nrlen=bymem[grouped_commandparam].length+bymem[grouped_commandparam][bymem[grouped_commandparam].length-1]['type'];
        //listval.toString(16).padStart(4,'0');

        let reqlen='0001'; //modbus defines 16bytes, some complex data are stored on multiple registers
        if (Number.isInteger(type)){
            reqlen=type.toString(16).padStart(4,'0');
        }
            
        command=command.replace('{PARAM}',addr+reqlen);

        
        //HANDLE set command...    
        let setparam="";
        let setparamind=0;
        let setval="";
        let setvalind=0;

        //get args and connected data
        let i=0;
        myargs.forEach(function(el) {

            if ( command.indexOf('{ARGP'+i+'}')!==-1) {
                setparamind=i;
                setparam=cmd.definition.find(o => o.num === el );
            }

            if ( command.indexOf('{ARGV'+i+'}')!==-1) {
                setvalind=i;
                setval=el;
            }

            i++;
        });

        //console.log(setparam);
        //console.log(setval);

        if (setparam!="" && setval!="") {

            if ( command.indexOf('{ARGP'+setparamind+'}')!==-1) {

                //default 1 register            
                let reglen="0001";
                if (Number.isInteger(setparam.type)) {
                    reglen=setparam.type.toString(16).padStart(4,'0');
                    console.log("Error: Not supported type:", setparam.type);
                    exit(-1);
                }    

                let specargparam=setparam.address+reglen;
                command=command.replace('{ARGP'+setparamind+'}',specargparam);
                
            }

            if ( command.indexOf('{ARGV'+setvalind+'}')!==-1) {
                //default 2 bytes
                let deflen='02';
                let rv='0000';

                if (Array.isArray(setparam.unit)) {
                    let listval=setparam.unit.indexOf(setval);
                    if (listval===-1){
                        console.log("Error: The requested value is not valid, values:", setparam.unit);
                        exit(-1);
                    }
                    if (Number.isInteger(listval)){
                        
                        rv=listval.toString(16).padStart(4,'0');
                    }else{
                        console.log("Error: The requested value is not compatible with the parameter type ("+setparam.type+")!");
                        exit(-1);
                    }
                    
                }else{

                    switch (setparam.type) {
                        case "UInt16BE":
                        case "Int16BE":
                            if (setval.match(/^[0-9\.]+$/) ){
                                if (parseInt(setval).toString() === setval){
                                    setval=parseInt(setval);    
                                }
                            }else{
                                console.log(setparam);
                                console.log("Error: The requested value ("+setval+") is not compatible with the parameter type!");
                                exit(-1);
                            }
                            
                            setval=Math.round(setval/setparam.rate);
                            rv=setval.toString(16).padStart(4,'0');

                        break;
                        default:
                            console.log(setparam);
                            console.log("Error: The requested parameter is not writable now!");
                            exit(-1);
                    }
                }

                //console.log(rv);
                
                let specargval=deflen+rv;
                //console.log("replace:",specargval);
                
                command=command.replace('{ARGV'+setvalind+'}',specargval);
                
            }
            
        }
        
        let matches=command.match(/\{LEN\}[a-f0-9A-F]{4}(.+)\{CRC\}$/);
        let inner="";
        if (matches) {
            //{CRC} -> 5 char vs 4char hex(2 byte): -1
            inner=Buffer.from(matches[1],'hex');
        }

        let crc=crc16modbus(inner);
        
        crc=crc.toString(16).padStart(4,'0');
        
        command=command.replace("{CRC}",crc.substring(2)+crc.substring(0,2));

        if (setparam!="" && setval!="") {
            console.log("Constructed modbus RTU command:"+command);
            //console.log("Dry run exiting here....");
            //exit(0);
        }    
            
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

}

runscript(process.argv);
