let net = require('net');
let fs = require('fs');
let dgram = require('dgram');
var localIpV4Address = require("local-ipv4-address");
const { exit } = require('process');
const { Buffer } = require('buffer');


function runscript(args) {

    var commands={};
    let cdata=fs.readFileSync('commands.json',{encoding:'utf8', flag:'r'});

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

    let check_commandparam=""

    //state object to for the sript to pass config, arugments and current pass
    
    var stateobject={

        'commands':commands,
        //run more commands after another: this is the sequence name
        'global_commandsequence':"",

        //current commandseq index
        'command_seq': 0,

        //modbus addresses by memory, we walk through this
        'bymem':[],

        //index for groups and params
        'bymem_index': 0,
        
        //sends the device in every command: modbus transaction id
        'global_tcp_seq':1,

        //modified arguments array
        'myargs':myargs,
        //json output
        'outobj':{},
        //text output
        'outsum':"\n"
    }    


    
    if (myargs.length==0){
        console.log("\n No command supplied! ");
    }else{

        stateobject.commands.commandsequences.forEach(function(cs){
            
            if (cs.name===myargs[0]){
                
                stateobject.global_commandsequence=myargs[0];
                console.log("Running: "+stateobject.global_commandsequence);

                argscount=[];
                cs.seq.forEach(function(cd){
                    let nc=stateobject.commands.commands.find(cdf => cdf.name === cd);
                    
                    let reg=nc.cmd.match(/\{ARG[PV]*[0-9]+\}/g);
                    if (reg!=null && reg!==false && reg!=undefined ) argscount=argscount.concat(reg);

                    //console.log(nc);
                    if (nc.hasOwnProperty('definition') && Array.isArray(nc.definition)) {
                        //exit(0);
                        
                        //optional last argumentum (start param to query)
                        let lastarg=myargs[myargs.length-1];
                        let ind=nc.definition.findIndex(o => o.num == lastarg );

                        check_commandparam=(lastarg.match(/^[0-9]+$/) && ind>0 ?ind:0);

                        console.log("Starting from param: ",check_commandparam);

                        //check addresses to join to query together
                        let addrord=[];
                        nc.definition.forEach(function(el,ind){
                            
                            if (ind>=check_commandparam){

                                let addr=parseInt(el.address, 16);
                                let to={'index': ind,'address':addr, 'name': el.name,'typelen': (Number.isInteger(el.type)?el.type:1)};
                                let inb={ ...el, ...to};
                                addrord.push(inb);
                                
                            }
                        });

                        addrord.sort(function(a,b){ return a.address-b.address });

                        
                        let lv=0;

                        addrord.forEach(function(el, ind){
                            if (stateobject.bymem.length==0){
                                stateobject.bymem.push([el]);
                            }else{

                                if (stateobject.bymem[lv][0].address+123>(el.address+(Number.isInteger(el.type)?el.type:1))){
                                    stateobject.bymem[lv].push(el);
                                }else{
                                    stateobject.bymem.push([el]);
                                    lv++;
                                }

                            }
                        });
                       
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

                console.log(stateobject.bymem);

                sendudp(myargs[1],stateobject);

            }

        });

    }


    function sendudp(devip,stateobject){

        try{

            localIpV4Address().then(function(ip){
            
                if (customip!=""){
                    ip=customip;
                }
                
                console.log("Using local ip to create TCP server: "+(ip));

                starttcp(stateobject);

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

    

    function starttcp(stateobject){

        let port=8899;

        console.log("starting TCP server(port: "+port+") to recieve data....");

        var server = net.createServer(function(socket) {

            console.log(`${socket.remoteAddress}:${socket.remotePort} connected on TCP`);
            
            //socket.pipe(socket);
            socket.on('data',function(data) {

                let result=receivedata(data,stateobject);

                socket.write(result.command);
              
            });

            socket.on('error',function(error){
                console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}..., exiting...`);
                exit(-1);
            });

            socket.on('close',function(){

                //this happens usually when the inverter drops the serial line
                //to force the datalogger to reconnect we need to restart it

                console.log(`${socket.remoteAddress}:${socket.remotePort} Connection closed, exiting and trying to restart datalogger adapter...`);
                console.log("\n");

                //close tcp server
                server.close();

                original_argv[2]="restart-wifi";
                runscript(original_argv);
                
            });

            //get first command to send
            let cmdstr=getcommseqcmd(stateobject);
            if (cmdstr === undefined) { console.log("Missing command sequence, exiting..."); exit(-1); }

            
            let tw=getdatacmd(cmdstr,stateobject);
            //console.log("write:",tw);
            socket.write(tw);
            
        });

        server.listen(port, '0.0.0.0');

    }

    
}

function getparam(cmd,ind){

    let param=cmd.definition.find(o => o.num === ind );
    if (param!==undefined) {
        console.log("Requested param: "+param.name);
        return param;
    }
    return "";    
}

function handle_modbus_command(command,cmd,stateobject) {

    if (!command.match(/{CRC}/)) return command;

    let addr = "";
    let type = "";

    if (stateobject.bymem.length>0){
        
        addr = stateobject.bymem[stateobject.bymem_index][0].address;
        addr = addr.toString(16).padStart(4,'0');
        type = stateobject.bymem[stateobject.bymem_index][0].type;

        console.log("Querying param from: "+stateobject.bymem[stateobject.bymem_index][0].num+" => "+stateobject.bymem[stateobject.bymem_index][0].name+"\n");
        
    }


    let reqlen='0001'; //modbus defines 16bytes, some complex data are stored on multiple registers
    if (Number.isInteger(type)){
        reqlen=type.toString(16).padStart(4,'0');
    }

    //join queries -> query the whole group
    if (stateobject.bymem.length>0) {
        let nrlen=stateobject.bymem[stateobject.bymem_index][stateobject.bymem[stateobject.bymem_index].length-1]['address']-stateobject.bymem[stateobject.bymem_index][0]['address']+stateobject.bymem[stateobject.bymem_index][stateobject.bymem[stateobject.bymem_index].length-1]['typelen'];
        let grplen=nrlen.toString(16).padStart(4,'0');
        reqlen=grplen;
    }   
    
        
    command=command.replace('{PARAM}',addr+reqlen);

    
    //HANDLE set command...    
    let setparam="";
    let setparamind=0;
    let setval="";
    let setvalind=0;

    //get args and connected data
    let i=0;
    stateobject.myargs.forEach(function(el) {

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


//get next command for the commany sequence by index
function getcommseqcmd(stateobject){
    

    let obj=stateobject.commands.commandsequences.find(o => o.name === stateobject.global_commandsequence );
    //console.log(obj);
    //console.log(stateobject.command_seq);
    return obj.seq[stateobject.command_seq];
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


function processpacket(data,def,offset=0){

    let handled=[];
    let outobj={};
    let outsum="";

    //modbus rtu response: fixed position to extract data from
    let val="";
    val=data.toString('hex');

    //process.stdout.write("Response orig:\n");
    //dumpdata(data);

    //data starts at byte 11
    startpos=11+offset;

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
    
    console.log("(Response info len: "+lenval+" Data type: "+def.type+" "+"CRC check: "+hcrc+" "+rcrc+")\n\n");

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

    return {"outobj": outobj, "outsum": outsum};

}


function receivedata(data,stateobject){
    
    
    if (stateobject.bymem.length>0){
        
        //lastcmddef.definition.forEach(function(def,ind){ });

        //process all query params
        let resarr=[];
        stateobject.bymem[stateobject.bymem_index].forEach(function(el,ind){

            let offset=0;
            //console.log('curr group:',stateobject.bymem[stateobject.bymem_index.group]);
            offset=2*(stateobject.bymem[stateobject.bymem_index][ind].address - stateobject.bymem[stateobject.bymem_index][0].address);
            console.log('offset',offset);
            let tmp=processpacket(data,el,offset);
            resarr.push({'ret': tmp,'index': el.index});
            
        });

        resarr.sort(function(a,b){ return a.index-b.index });

        resarr.forEach(function(el,ind){
            
            if (el!==undefined) {
                //do some work to restore the original order
                stateobject.outsum += el.ret.outsum;
                stateobject.outobj = {...stateobject.outobj,...el.ret.outobj};
            }
            
        });
        
        //run the sequence again (with another param) if more groups exists
        

        if (stateobject.bymem[stateobject.bymem_index+1] !== undefined ) {
            
            console.log('new group:',stateobject.bymem_index+1);
            stateobject.bymem_index=stateobject.bymem_index+1;

        }else{
            //finished with groups -> next command
            stateobject.command_seq++;
        }

    }else{

        

        process.stdout.write("Response:\n");

        dumpdata(data);

        console.log("String format:\n",data.toString());
    }

    

    let cmdstr=getcommseqcmd(stateobject);
        
    if (cmdstr === undefined) { 
        //console.log(outsum);

        console.log("JSON output:\n",stateobject.outobj);
        
        if (stateobject.outobj.constructor === Object && Object.keys(stateobject.outobj).length > 0) {
            
            try {
                fs.writeFileSync('currentdata.json',JSON.stringify(stateobject.outobj));
            } catch (err) {
                console.error(err)
            }
        }    
        
        console.log("DONE, exiting"); 
        exit(0);
    }
    
    
    let comd=getdatacmd(cmdstr,stateobject);
    
    return {'command': comd};


    
}

function getdatacmd(data,stateobject){

    console.log("\nCommand: "+data);

    let obj=stateobject.commands.commands.find(o => o.name === data );
    //definition array link following
    if (typeof obj.definition === 'string'){
        obj.definition=stateobject.commands.commands.find(o => o.name === obj.definition ).definition;
    }

    let cmdtorun=obj.cmd;
    //place simple input args in modbus commands
    let i=0;
    stateobject.myargs.forEach(function(el){

        let hext=Buffer.from(el, 'utf8').toString('hex');
        if (obj.hasOwnProperty('raw') && obj.raw===true){
            hext=el;
        }
        cmdtorun=obj.cmd.replace('{ARG'+i+'}',hext);
        i++;
    });

    //custom built modbus command
    cmdtorun=handle_modbus_command(cmdtorun,obj,stateobject);

    //compute and place length where needed
    let matches=cmdtorun.match(/\{LEN\}(.+)$/);
    if (matches) {
        cmdtorun=cmdtorun.replace("{LEN}",(matches[1].length/2).toString(16).padStart(4, '0'));
    }

    //add modbus tcp transaction id, just an incemental index
    cmdtorun=cmdtorun.replace('{SEQ}',String(stateobject.global_tcp_seq).padStart(4, '0'));
    stateobject.global_tcp_seq++;

    process.stdout.write("Request: ");
    dumpdata(cmdtorun);
    

    return Buffer.from(cmdtorun, 'hex');
}

runscript(process.argv);