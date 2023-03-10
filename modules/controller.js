let net = require('net');
let fs = require('fs');
let dgram = require('dgram');
var localIpV4Address = require("local-ipv4-address");
const { Buffer } = require('buffer');

function _log(lcallback,...data){
    lcallback(data);
}

const controller = function(args,timeoutsec=30,priority=0,actioncallback=function(){},logcallback=function(){}) {

    const group_len_const=20;

    var commands={};
    let cdata=fs.readFileSync('commands.json',{encoding:'utf8', flag:'r'});

    try{
        commands=JSON.parse(cdata);
    }catch(e){
        _log(logcallback,e);
        actioncallback(-1);
        return;
    }

    _log(logcallback,"!!! 0. Please connect to the datalogger wifi access point or ensure the device is accessible on your network !!!");
    _log(logcallback,"!!! On initial setup the datalogger ip address is the gateway (obtained by dhcp from the datalogger wifi AP) !!!");
    _log(logcallback,"!!! Provide custom local ip if the machine that you are running this script from is available on a custom route not on the default one (vpn setup) !!!");

    _log(logcallback,"Quick examples:\n Query all inverter parameters: npm start get-smx-param [datalogger ip address]");
    _log(logcallback," Set output priority(parameter 1) to SOL: npm start set-smx-param [datalogger ip address] 1 SOL ");

    let customip="";
    let original_argv=args.slice();
    
    args.forEach(function(el, index, object){
        //_log(el);
        let m=el.match(/^localip=((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/);
        if (m) {
            //if localip is provided before command -> error
            if (index==2) {
                _log(logcallback,'Argument error: No COMMAND provided!');
                _log(logcallback,"\nUSAGE: COMMAND [options] [localip=192.168.89.255]\n\nCOMMANDS:")
                commands.commandsequences.forEach(function(cs){
                    _log(logcallback,cs.name+" "+cs.args+" \n ("+cs.desc+")\n");
                });

                actioncallback(-1);
                return;
            }
            customip=el.substring(8);
            _log(logcallback,"")
            object.splice(index,1);
        }
    });
    
    var myargs = args.slice(2);

    _log(logcallback,"\nUSAGE: COMMAND [options] [localip=192.168.89.255]\n\nCOMMANDS:")
    commands.commandsequences.forEach(function(cs){
        _log(logcallback,cs.name+" "+cs.args+" \n ("+cs.desc+")\n");
    });

    _log(logcallback,"\n");

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
        'outsum':"\n",
        //modbus last request helper
        'lastrequest':"",
        'callback': actioncallback,
        'endcallback': function(rv){

            _log(logcallback,"Freeing resources, closing connections...");

            this.resources.forEach(function(r){
                if (r.udpclient!==undefined){
                    try{
                        r.udpclient.close();
                        r.udpclient=undefined;
                    }catch(e){
        
                    }
                }
                if (r.tcpsocket!==undefined){
                    try{
                        r.tcpsocket.end();
                        r.tcpsocket=undefined;
                    }catch(e){
        
                    }    
                }

                if (r.tcpserver!==undefined){
                    try{
                        r.tcpserver.close();
                        r.tcpserver=undefined;
                    }catch(e){
        
                    }    
                }
               
            });
        
            if (this.timeout!==null){
                
                clearTimeout(this.timeout);
            }
        
            this.callback(rv,this);
            this.endcallback=function(rv){ console.log("Endcallback fireing again, dont't doing anything, result:",rv); };
        },
        'logcallback':logcallback,
        'resources': [],
        'timeout': null

    }
    
    if (myargs.length==0){
        _log(logcallback,"\nNo command supplied!\n");
        
    }else{

        let foundcommand=0;
        stateobject.commands.commandsequences.forEach(function(cs){
            
            if (cs.name===myargs[0]){

                foundcommand=1;

                stateobject.global_commandsequence=myargs[0];
                _log(logcallback,"Running: "+stateobject.global_commandsequence);

                argscount=[];
                cs.seq.forEach(function(cd){
                    let nc=stateobject.commands.commands.find(cdf => cdf.name === cd);
                    
                    let reg=nc.cmd.match(/\{ARG[PV]*[0-9]+\}/g);
                    if (reg!=null && reg!==false && reg!=undefined ) argscount=argscount.concat(reg);

                    if (nc.hasOwnProperty('definition') && Array.isArray(nc.definition)) {
                                  
                        //optional last argumentum (start param to query)
                        let lastarg=myargs[myargs.length-1];
                        let ind=nc.definition.findIndex(o => o.num == lastarg );

                        check_commandparam=(lastarg.match(/^[0-9]+$/) && ind>0 ?ind:0);

                        _log(logcallback,"Starting from param: ",check_commandparam);

                        //check addresses to join to query together
                        let addrord=[];
                        nc.definition.forEach(function(el,ind){
                            
                            if (ind>=check_commandparam){

                                if (priority==1) {
                                    if (typeof el.priority === 'undefined' || el.priority == 0 ){
                                        return;
                                    }
                                }

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

                                if (stateobject.bymem[lv][0].address+group_len_const>(el.address+(Number.isInteger(el.type)?el.type:1))){
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
                    _log(logcallback,"Wrong number of arguments! Exiting...");
                    actioncallback(-1);
                    return;
                }

                //default 4 min timeout to prevent stucking node if not error event occures in tcp communication but no answer recived
                stateobject.timeout=setTimeout(function() {

                    
                    _log(logcallback,"Timeout occured...exiting!");

                    stateobject.endcallback(-1);
                    
                }, (1000*timeoutsec));

                sendudp(myargs[1],stateobject);

            }

        });

        if (foundcommand==0){
            _log(logcallback,"\nNo command supplied!\n\n");
            actioncallback(-1);
            return;
        }

    }


    function sendudp(devip,stateobject){

        try{

            localIpV4Address().then(function(ip){
            
                if (customip!=""){
                    ip=customip;
                }
                
                _log(stateobject.logcallback,"Using local ip to create TCP server: "+(ip));

                starttcp(stateobject);

                var client = dgram.createSocket('udp4');
                stateobject.resources.push({'udpclient':client});

                let port=58899;
                let command="set>server="+ip+":8899;";
                
                _log(stateobject.logcallback,"Sending UDP packet(to ip: "+devip+" port: "+port+") to inform datalogger device to connect our TCP server:");
                _log(stateobject.logcallback,command);

                client.on('listening', function () {
                    var address = client.address();
                    _log(stateobject.logcallback,'UDP server listening on ' + address.address + ":" + address.port);
                });

                client.on('error', (err) => {
                    _log(stateobject.logcallback,`UDP server error:\n${err.stack}`);
                    client.close();
                });

                client.on('message',function(message, remote){
                    _log(stateobject.logcallback,remote.address + ':' + remote.port +' - ' + message);
                    _log(stateobject.logcallback,"Got answer, closing UDP socket...");
                    client.close();
                });

                

                client.send(command,0, command.length, port, devip);

            });

        }catch(e){
            _log(stateobject.logcallback,"UDP Error: ",e);
            stateobject.endcallback(-1);
        }
        
    }

    

    function starttcp(stateobject){

        let port=8899;

        _log(stateobject.logcallback,"starting TCP server(port: "+port+") to recieve data....");

        
            var server = net.createServer(function(socket) {

                stateobject.resources.push({'tcpsocket':socket});

                _log(stateobject.logcallback,`${socket.remoteAddress}:${socket.remotePort} connected on TCP`);
                
                //socket.pipe(socket);
                socket.on('data',function(data) {

                    let result=receivedata(data,stateobject);

                    if (result==null) {
                        
                        return;
                    }

                    socket.write(result.command);
                
                });

                socket.on('error',function(error){
                    _log(stateobject.logcallback,`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}..., exiting...`);
                    stateobject.endcallback(-1);
                });

                socket.on('close',function(){

                    //this happens usually when the inverter drops the serial line
                    //to force the datalogger to reconnect we need to restart it

                    _log(stateobject.logcallback,`${socket.remoteAddress}:${socket.remotePort} Connection closed, socket closed....`);
                    _log(stateobject.logcallback,"\n");

                    //close resource and we can try to restart!
                    stateobject.endcallback(-2);
                    
                });

                //get first command to send
                let cmdstr=getcommseqcmd(stateobject);
                if (cmdstr === undefined) { _log(stateobject.logcallback,"Missing command sequence, exiting..."); stateobject.endcallback(-1); return; }

                
                let tw=getdatacmd(cmdstr,stateobject);
                _log(stateobject.logcallback,"Write to tcp:",tw);

                socket.write(tw);
                
            });
            
            stateobject.resources.push({'tcpserver':server});

        
        
        try {

            server.listen(port, '0.0.0.0');

        } catch (e) {
            _log(stateobject.logcallback,"TCP Error: ",e);
            stateobject.endcallback(-1);
        }   

    }

    
}

function handle_modbus_command(command,cmd,stateobject) {

    if (!command.match(/{CRC}/)) return command;

    let addr = "";
    let type = "";

    if (stateobject.bymem.length>0){
        
        addr = stateobject.bymem[stateobject.bymem_index][0].address;
        addr = addr.toString(16).padStart(4,'0');
        type = stateobject.bymem[stateobject.bymem_index][0].type;

        _log(stateobject.logcallback,"Querying param from: "+stateobject.bymem[stateobject.bymem_index][0].num+" => "+stateobject.bymem[stateobject.bymem_index][0].name+"\n");
        
    }


    let reqlen='0001'; //modbus defines 16bytes, some complex data are stored on multiple registers
    if (Number.isInteger(type)){
        reqlen=type.toString(16).padStart(4,'0');
    }

    //join queries -> query the whole group
    if (stateobject.bymem.length>0) {
        let nrlen=stateobject.bymem[stateobject.bymem_index][stateobject.bymem[stateobject.bymem_index].length-1]['typelen']+
        stateobject.bymem[stateobject.bymem_index][stateobject.bymem[stateobject.bymem_index].length-1]['address']-
        stateobject.bymem[stateobject.bymem_index][0]['address'];

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
  
    if (setparam!="" && setval!="") {

        if ( command.indexOf('{ARGP'+setparamind+'}')!==-1) {

            //default 1 register            
            let reglen="0001";
            if (Number.isInteger(setparam.type)) {
                reglen=setparam.type.toString(16).padStart(4,'0');
                _log(stateobject.logcallback,"Error: Not supported type:", setparam.type);
                stateobject.endcallback(-1);
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
                    _log(stateobject.logcallback,"Error: The requested value is not valid, values:", setparam.unit);
                    stateobject.endcallback(-1);
                }
                if (Number.isInteger(listval)){
                    
                    rv=listval.toString(16).padStart(4,'0');
                }else{
                    _log(stateobject.logcallback,"Error: The requested value is not compatible with the parameter type ("+setparam.type+")!");
                    stateobject.endcallback(-1);
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
                            _log(stateobject.logcallback,setparam);
                            _log(stateobject.logcallback,"Error: The requested value ("+setval+") is not compatible with the parameter type!");
                            stateobject.endcallback(-1);
                        }
                        
                        setval=Math.round(setval/setparam.rate);
                        rv=setval.toString(16).padStart(4,'0');

                    break;
                    default:
                        _log(stateobject.logcallback,setparam);
                        _log(stateobject.logcallback,"Error: The requested parameter is not writable now!");
                        stateobject.endcallback(-1);
                }
            }
            
            let specargval=deflen+rv;
            
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
        _log(stateobject.logcallback,"Constructed modbus RTU command:"+command);
    }    
        
    return command;

}


//get next command for the commany sequence by index
function getcommseqcmd(stateobject){
    

    let obj=stateobject.commands.commandsequences.find(o => o.name === stateobject.global_commandsequence );

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
function dumpdata(data,handled=null,stateobject){

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

    _log(stateobject.logcallback,out);

}


function processpacket(data,def,offset=0,stateobject){

    //_log(stateobject.logcallback,def);

    let handled=[];
    let outobj={};
    let outsum="";
    let modbusexception=false;
    

    //modbus rtu response: fixed position to extract data from
    let val="";
    val=data.toString('hex');

    //process.stdout.write("Response orig:\n");
    //dumpdata(data);

    let startlen=11;
    //data starts at byte 11
    startpos=startlen+offset;

    //default error log string
    let outt=(def.hasOwnProperty('num')?def.num.padStart(2,'0')+" ":"")+def.name+":\t \t NA : ERROR IN RESPONSE!";

    //checking packet length
    if (data.length>startlen){
                
        lenval=data[10];
        rescode=data[9];
        
        let tmpbuf=data.slice(8,data.length-2);
        let rec_crc=data.slice(data.length-2,data.length);
        
        rec_crc=rec_crc.readUInt16BE().toString(16).padStart(4,'0');
        
        let chcrc=crc16modbus(tmpbuf);
        chcrc=chcrc.toString(16).padStart(4,'0');

        let hcrc=chcrc.substring(2)+chcrc.substring(0,2);
        
        _log(stateobject.logcallback,"(Response info len: "+lenval+" Data type: "+def.type+" "+"CRC check: "+hcrc+" "+rec_crc+")\n");

        //test for modbus exception
        if (rescode>128){
            
            let msg=['Illegal function','Illegal data address','Illegal data value','Slave device failure','Acknowledge','Slave device busy','Negative acknowledgment','Memory parity error',
            'Gateway path unavailable','Gateway target device failed to respond'].find(function(e,i){ return (i+1)==lenval; });
            _log(stateobject.logcallback,'Modbus exception: ',rescode.toString(16).padStart(2,'0'),lenval.toString(16).padStart(2,'0') , msg);
            _log(stateobject.logcallback,"\n");

            modbusexception=true;

        }

        if (hcrc!=rec_crc){
            _log(stateobject.logcallback,"Modbus CRC error!\n");
        }

        

        if (hcrc!=rec_crc || modbusexception){
    
            _log(stateobject.logcallback,outt+"1");

            outobj[def.name]="N/A";
            outsum+=outt+"\n";

        }else{

            //custom formats
            //1. string with fixed length
            if ( Number.isInteger(def.type) ){
                _log(stateobject.logcallback,"Getting from buffer: string:",def.type," from ",startpos," to ",startpos+(def.type*2));

                //type with custom length: not needed -> string default
                //val=val.substring(startpos*2,startpos*2+(lenval*2));

                for(let c=0;c<def.type*2;c++){
                    handled[startpos*2+c]=1;
                }

                //check length again
                if (data.length>=startpos+(def.type*2)+2){

                    //default handle as string
                    let nb=data.slice(startpos,startpos+(def.type*2));
                    nb=nb.toString('utf8').replace(/\0/g, '');

                    if (def.hasOwnProperty('format')){
                        //datetime
                        if (def.format===100){
                            nb= "20"+data.readUInt8(startpos).toString().padStart(2,'0')+"-"+
                                data.readUInt8(startpos+1).toString().padStart(2,'0')+"-"+
                                data.readUInt8(startpos+2).toString().padStart(2,'0')+" "+
                                data.readUInt8(startpos+3).toString().padStart(2,'0')+":"+
                                data.readUInt8(startpos+4).toString().padStart(2,'0')+":"+
                                data.readUInt8(startpos+5).toString().padStart(2,'0');
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
                    outobj[def.name]=val;

                    let stmp=(def.hasOwnProperty('num')?def.num.padStart(2,'0')+" ":"")+def.name+":\t \t "+val+" "+(Array.isArray(def.unit)?( def.unit[parseInt(val)]!==undefined? (" => "+def.unit[parseInt(val)]): '' ):def.unit);
                    _log(stateobject.logcallback,stmp+"\n");
                    
                    
                    if (Array.isArray(def.unit) && def.unit[parseInt(val)]!==undefined ) {
                        outobj[def.name+"_text"]=def.unit[parseInt(val)];
                    }
                    outsum+=stmp+"\n";

                }else{
                    
                    _log(stateobject.logcallback,outt+"2");

                    outobj[def.name]="N/A"; //<- added as value, can/must be checked later
                    outsum+=outt+"\n";
                }

            }else{

                //basic types supported by Buffer class: most seem to be 2 bytes long
                _log(stateobject.logcallback,"Getting from buffer: ",def.type,startpos);

                //check length again
                if (data.length>=startpos+2+2){

                    val=data['read'+def.type](startpos);

                    //hack: mark always 2 bytes: for debugging
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
                    
                    outobj[def.name]=parseFloat(val);

                    let stmp=(def.hasOwnProperty('num')?def.num.padStart(2,'0')+" ":"")+def.name+":\t \t "+val+" "+(Array.isArray(def.unit)?( def.unit[parseInt(val)]!==undefined? (" => "+def.unit[parseInt(val)]): '' ):def.unit);
                    _log(stateobject.logcallback,stmp+"\n");
                    
                    
                    if (Array.isArray(def.unit) && def.unit[parseInt(val)]!==undefined ) {
                        outobj[def.name+"_text"]=def.unit[parseInt(val)];
                    }
                    outsum+=stmp+"\n";

                }else{
                    
                    _log(stateobject.logcallback,outt+"3 "+data.length+">"+(startpos+2+2));

                    outobj[def.name]="N/A"; //<- added as value, can/must be checked later
                    outsum+=outt+"\n";
                }    
            }
            
        }
    }else{


        _log(stateobject.logcallback,outt);

        outobj[def.name]="N/A"; //<- added as value, can/must be checked later
        outsum+=outt+"\n";

    }        

    _log(stateobject.logcallback,"Response:\n");
    dumpdata(data,handled,stateobject);

    _log(stateobject.logcallback,"\n\n-----------------\n");

    return {"outobj": outobj, "outsum": outsum};

}


function receivedata(data,stateobject){
    
    //get params response processing
    if (stateobject.bymem.length>0){
       
        //process all query params
        let resarr=[];
        stateobject.bymem[stateobject.bymem_index].forEach(function(el,ind){

            let offset=0;
            //_log(stateobject.logcallback,'curr group:',stateobject.bymem[stateobject.bymem_index.group]);
            offset=2*(stateobject.bymem[stateobject.bymem_index][ind].address - stateobject.bymem[stateobject.bymem_index][0].address);
            
            //process classic register read packet
            let tmp=processpacket(data,el,offset,stateobject);
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
            
            _log(stateobject.logcallback,'New group request: ',stateobject.bymem_index+1);
            stateobject.bymem_index=stateobject.bymem_index+1;

        }else{
            //finished with groups -> next command
            stateobject.command_seq++;
        }

    //process set register commands, datalogger commands, etc.
    }else{
        
        let current_command=getcommseqcmd(stateobject);
        
        stateobject.command_seq++;

        _log(stateobject.logcallback,"Response:\n");

        dumpdata(data,null,stateobject);
        
        _log(stateobject.logcallback,"String format:\n",data.toString());

        //_log(stateobject.logcallback,stateobject.commands.commands);
        let tmpcomdef=stateobject.commands.commands.find(o => o.name === current_command );
        //_log(stateobject.logcallback,tmpcomdef);

        //if the command definition was linked to the "get" commands one(definition preaviusly copied), this is consdered as a modbus set operation -> check if it was succesful and update json data
        if (tmpcomdef != undefined && Array.isArray(tmpcomdef.definition) ){
            _log(stateobject.logcallback,"Modbus write operation result check...");
            //let origdef=stateobject.commands.commands.find(o => o.name === tmpcomdef.definition ).definition;

            //check crc and compare to request 
            let datastart=10;
            let tmpbuf=data.slice(datastart,data.length-2);

            let rec_crc=data.slice(data.length-2,data.length);
            
            rec_crc=rec_crc.readUInt16BE().toString(16).padStart(4,'0');
            
            let chcrc=crc16modbus(tmpbuf);

            chcrc=chcrc.toString(16).padStart(4,'0');

            let hcrc=chcrc.substring(2)+chcrc.substring(0,2);

            if (!hcrc==rec_crc){
                _log(stateobject.logcallback,"Modbus CRC error!");
            }else{
                _log(stateobject.logcallback,"Modbus CRC ok!");
            }

            let rdata=stateobject.lastrequest.slice(datastart,data.length-2);
            //_log(stateobject.logcallback,rdata);
            //_log(stateobject.logcallback,tmpbuf);
            if (Buffer.compare(rdata,tmpbuf)===0){
                _log(stateobject.logcallback,"Successful set operation!");
                stateobject.endcallback(0);
            }else{
                _log(stateobject.logcallback,"Error while setting paramter!");
                stateobject.endcallback(-1);
            }
        }
        

    }


    let cmdstr=getcommseqcmd(stateobject);
        
    if (cmdstr === undefined) { 
        //_log(stateobject.logcallback,outsum);

        _log(stateobject.logcallback,"JSON output:\n",stateobject.outobj);
        
        _log(stateobject.logcallback,"DONE, exiting"); 
        stateobject.endcallback(0);

        return null;

    }
    
    
    let comd=getdatacmd(cmdstr,stateobject);
    
    return {'command': comd};


    
}

function getdatacmd(data,stateobject){

    _log(stateobject.logcallback,"\nCommand: "+data);

    let obj=stateobject.commands.commands.find(o => o.name === data );

    if (obj===undefined){
        _log(stateobject.logcallback,"Unknown Exception(in getdatacmd): data: ",data," commands:",stateobject.commands.commands);
    }

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

    //console.log(obj);
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

    _log(stateobject.logcallback,"Request: ");
    dumpdata(cmdtorun,null,stateobject);
    
    let rbuf=Buffer.from(cmdtorun, 'hex');
    stateobject.lastrequest=rbuf;
    return rbuf;
}



exports.controller=controller;


