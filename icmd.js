const controllerobject = require("./modules/controller.js");
const httpdash = require("./modules/httpdash.js");
let fs = require('fs');
var express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const notifier = require("./modules/notifier.js");
const detect = require("./modules/detect.js");
const watchdog = require("./modules/watchdog.js");
const paramstore = require("./modules/storage.js");
let store = new paramstore();
const helper = require("./modules/helper.js");
const charts = require("./modules/charts.js");
const batterymodels = require("./modules/batterymodels.js");
const energymodels = require("./modules/energymodels.js");
const safeswitch = require("./modules/safeswitch.js");



process.on('uncaughtException', function(err) {
    if(err.errno === 'EADDRINUSE')
        console.log("Process Exception: EADDRINUSE, perhaps port already used...Details:",err);
    else
        console.log("Process Exception: ",err);
});

let real_time_monitor_interval=10000;
let low_freq_monitor_at_nth_interval=4;
let full_param_query_at_nth_interval=20;

if (process.argv.length<3){

    console.log("\nNo command supplied! To explore modbus debug options or test from command line, use: npm start help\nStarting web ui mode....\n");

    let config="";
    try{
        config=fs.readFileSync('config.json',{encoding:'utf8', flag:'r'});
    }catch(e){
        console.log(e);
    }
    let configobj={};

    try{
        configobj=JSON.parse(config);
    }catch(e){
        console.log(e);
    }

    if (configobj["actions"] == undefined){

        configobj["actions"]=[
            {"action_check_connection":"notify"},
            {"action_check_numeric_value":"notify","param":"BatteryVoltage","min":25.5,"max":29.3},
            {"action_check_fault_code":"notify"},
            {"action_check_param_missing":"notify"}
        ];


    }

    let monitor_interval=null;
    let scheduler_tick=0;
    let client_seen=helper.unixTimestamp();
    let command_queue=[];
    let command_result=[]; 
    
    //start our watchdog
    let wd = new watchdog();
    let batterymodel = new batterymodels();
    let energymodel = new energymodels();

    let safeswitchinst = new safeswitch();

    var app = express();

    if (configobj["password"]!==undefined) {
        console.log("Using web auth: smx/"+configobj["password"]);
        app.use(basicAuth({
            users: { 'smx': configobj["password"] },
            unauthorizedResponse: function(){ return "Provide 'smx' user password to continue!";},
            challenge: true
        }));
    };

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    app.use('/static', express.static(__dirname+"/node_modules/bootstrap/dist/"));
    app.use('/statice', express.static(__dirname+"/node_modules/@json-editor/json-editor/dist/"));
    app.use('/statica', express.static(__dirname+"/node_modules/apexcharts/dist/"));
    
    app.post('/saveconfig',function (req, res) {

        console.log("save:",req.body);
        
        configobj=req.body;
        console.log("Apply config:", configobj);

        try {
            fs.writeFileSync('config.json',JSON.stringify(req.body));
        } catch (err) {
            console.error(err)

            res.json({"rv": 0,"msg":"Error!"});
            notifier.notifier(configobj,"TEST message: Save error!","Save error!");

            return;
        } 

        notifier.notifier(configobj,"TEST message: Save ok!","Save ok!");

        scheduler_tick=0;
        console.log("Setting full query next....");

        wd.truncate();
        res.json({"rv": 1,"msg":"Save ok! Please check sent test notification(s)!"});

    });

    app.get('/', function (req, res) {

        res.send(httpdash.httpdash(req,configobj,wd.get_ui_schema(),batterymodels.get_ui_schema(),energymodels.get_ui_schema()));

    });

    app.get('/detect', function (req, res) {

        detect.detect(function(obj){
            res.json(obj);
        });
        
    });

    app.post('/getchart',function (req, res) {

        console.log("getchart:",req.body);
        
        let html=charts.getchart(req.body,configobj,store.get(),store.gethistory());

        res.json({"rv": 1,"html": html});

    });


    app.post('/set', function (req, res) {

        console.log("Parameter set called:");
                
        let inp=req.body;

        if ( inp.paramid!=undefined && (inp.value!=undefined) && req.query.client!=undefined ){

            _send_command(configobj,inp.paramid,inp.value,req.query.client);

            /*
            let args=[process.argv[0],process.argv[1],'set-smx-param'];

            if (configobj.ipaddress!==undefined){
                args.push(configobj.ipaddress);
            }
            if (configobj.localipaddress!==undefined && configobj.localipaddress!=""){
                args.push("localip="+configobj.localipaddress);
            }
            
            args.push(inp.paramid);
            args.push(inp.value);

            console.log("command -> queue:",args);

            let client="";
            if (req.query.client != undefined){
                client=req.query.client;
            }    
            command_queue.push({"client":client,"args":args});
            */

            res.json({"rv": 1,"msg": "Operation queued!"});
            
        }else{
            res.json({"rv": 0,"msg":"Param Error!"});
        }

    });

    app.get('/query', function (req, res) {

        client_seen=helper.unixTimestamp();
       
        let dov=store.get();

        if (req.query.client != undefined){

            let add=[];
            command_result.forEach(function(el,index,obj){
                //delete old data
                if (el.date<helper.unixTimestamp()-500){
                    obj.splice(index,1);
                }
                if (el.client==req.query.client){
                    add.push(el.msg+" - "+JSON.stringify(el.args.slice(2)));
                    obj.splice(index,1);
                    
                }
            });
            if (add.length>0) {
                let inp={"msg":add}; 
                dov={...dov,...inp};
            }
            let wg={'notif':wd.get_current()};
            dov={...dov,...wg};
            
            //console.log(charts);
            let wg2={'chart':charts.getchartinfo()};
            dov={...dov,...wg2};

            let wg3={'batteryinfo':batterymodel.get_current()};
            dov={...dov,...wg3};

            let wg4={'energyinfo':energymodel.get_current()+"<div>"+safeswitchinst.getstate()+"</div><div>MODE CONTROL: "+(mode_control_enabled(configobj)?"<span>ON</span>":"<span>OFF</span>")+"</div>"};
            dov={...dov,...wg4};
        }
              
        res.json(dov);
        
    });

    let port=6789;
    app.listen(6789, function () {

        console.log("Web ui running on port "+port+"! Access: http://localhost:"+port);

    });
    
    monitor_lock=0;
      
    setTimeout(function(){
        setInterval(function() { 

            console.log("Running watchdog task! #############################################################################################");
            wd.run(configobj,store.get(),store.gethistory());
            
        },30000);
    },60000
    );

    setInterval(function() { 

        console.log("Running internal tasks! #############################################################################################");

        let currstore=store.get();

        let virtual_states=safeswitchinst.getmodes();

        /**
         * Virtual mode:

            1. init állapot -> felveszi ami van
            2. normál futásnál a fake-elt állapotot szolgáltatja a model számára

           Production mode:
           
           1. init állapot -> felveszi ami van
           2. szinkronizáljuk az állapotokat:
            - ha van váltás akkor az inverter fele
            - a model adathalmaza az inveterről kapott adat


           Bad test case:

                safeswitch in UTI
                inveter in SBU
                mode_control: disabled

                -mode_control: enable (turned on)
                -model test result: based on inveter data: need switching to UTI
                -safeswitch thinks no need to switch due to its in UTI
                    
            Resolution:
                ???? feed data back to update virtual states in safeswitch -> makes chaos when inverter data is not immediately got back
                ???? resync once when control turned on?: meanwhile state could be changed manualy tha same problem occurs....
                ???? if state differ and control on -> don't switch, rather sync

         */

        //pass virtual state for model for "testing"
        if (!mode_control_enabled(configobj) && virtual_states.stored_mode!="") {
            currstore['OutputPriority_text']=virtual_states.stored_mode;
            currstore['ChargerSourcePriority_text']=virtual_states.stored_charge;
        }

        if  (
            mode_control_enabled(configobj) && 
                (currstore['OutputPriority_text']!=virtual_states.stored_mode || currstore['ChargerSourcePriority_text']!=virtual_states.stored_charge)
            ){

                console.log("Virtual state differs from real, syncronizing states");
                _send_command(configobj,"OutputPriority",new_virtual_states.stored_mode,'internal');
                _send_command(configobj,"ChargerSourcePriority",new_virtual_states.stored_charge,'internal');
                
        }else{

            batterymodel.run(configobj,currstore,store.gethistory());
            let suggestion=energymodel.run(configobj,currstore,store.gethistory());
            
            if (currstore['OutputPriority_text'] != undefined && currstore['OutputPriority_text'] != "N/A" && currstore['ChargerSourcePriority_text']!=undefined && currstore['OutputPriority_text'] != "N/A" ){
                safeswitchinst.init(currstore['OutputPriority_text'],currstore['ChargerSourcePriority_text']);
            }
            
            if (suggestion!=false) {
                safeswitchinst.switch_mode(configobj,suggestion.suggested_mode,suggestion.suggested_charge);
            
                console.log("Energymodel has suggestion");
                //real switching -> after switch immediately or after some time: let time to get result back in currentstore data
                if (mode_control_enabled(configobj) &&  safeswitchinst.need_sync()){


                    //optimális eset: kell váltani -> a safeswitch átvált
                    console.log("Energymodel: mode_control_enabled AND safewsitch need_sync");
                    let new_virtual_states=safeswitchinst.getmodes();

                    if (currstore['OutputPriority_text']!=new_virtual_states.stored_mode){
                        
                        _send_command(configobj,"OutputPriority",new_virtual_states.stored_mode,'internal');
                    
                    }

                    if (currstore['ChargerSourcePriority_text']!=new_virtual_states.stored_charge){
                        
                        _send_command(configobj,"ChargerSourcePriority",new_virtual_states.stored_charge,'internal');
                    }

                }

            }
        }    
        
    },60000);

    // 0 -> full query   1 -> only important
    function monitor(prio=0) {

        if (monitor_lock) {
            return false;
        }

        monitor_lock=1;

        let args=[process.argv[0],process.argv[1],'get-smx-param'];

        if (configobj.ipaddress!==undefined){
            args.push(configobj.ipaddress);
        }
        if (configobj.localipaddress!==undefined && configobj.localipaddress!=""){
            args.push("localip="+configobj.localipaddress);
        }

        //need longer timeout to catch tcp disconnect when device is frozen
        controllerobject.controller(args,40,prio,
            function(result,stateobject){
                if (result==0){
                    
                    if (stateobject !== undefined && stateobject.outobj.constructor === Object && Object.keys(stateobject.outobj).length > 0) {
                       store.store(stateobject.outobj,prio,batterymodel.get_chosen());
                    }

                    monitor_lock=0;

                }else{

                    //hack to restart stucked datalogger
                    if (result==-2) {

                        console.log("Trying to restart datalogger adapter...");

                        args[2]="restart-wifi";
                        controllerobject.controller(args,10,1,
                            function(result,stateobject){
                                console.log("Restart callback result:", result);
                                monitor_lock=0;                                
                            },
                            function(log){
                                    log.forEach(element => {
                                    console.log(element);   
                                    });
                                    
                            }
                        );   

                    }else{
                        monitor_lock=0;
                    }
                    
                }
                
            },
            function(log){
                    log.forEach(element => {
                    console.log(element);   
                    });
                    
            }
        );
        return true;
    };

    

    function scheduler(){

        if (command_queue.length>0){

            if (monitor_lock==0){

                monitor_lock==1;

                let tmpa=command_queue.shift();
                console.log(tmpa.args);
                controllerobject.controller(tmpa.args,5,0,
                    function(result,stateobject){

                        monitor_lock==0;

                        if (result==0){
                            console.log("Modify OK!",tmpa.args);
                            if (tmpa.client!='internal') {
                                command_result.push({"date":helper.unixTimestamp(),"client": tmpa.client,"msg":"Modify OK!","args":tmpa.args});
                            }    
                          
                        }else{
                            if (tmpa.client!='internal') {
                                command_result.push({"date":helper.unixTimestamp(),"client": tmpa.client,"msg":"Modify Error!","args":tmpa.args});
                            }    
                            console.log("Modify Error!",tmpa.args);
                        }
                    },
                    function(log){
                        log.forEach(element => {
                            console.log(element);   
                        });
                        
                    }
                );

            }

            return;

        }

        if (client_seen<helper.unixTimestamp()-60){
            if ((scheduler_tick%low_freq_monitor_at_nth_interval)!=0) {
                console.log("Low freq, querying later");
                scheduler_tick++;
                return;
            }
        }

        console.log("Scheduler run...",scheduler_tick);
        if (scheduler_tick%full_param_query_at_nth_interval == 0) {
            console.log("Running long query");
            if (monitor(0)){
                scheduler_tick=1;
            }else{
                console.log("Still in progress");
            }
            
        }else{
            console.log("Running fast query");
            if (monitor(1)){
                scheduler_tick++;
            }else{
                console.log("Still in progress");
            }
        }
        

    }

    monitor_interval=setInterval(function(){ scheduler(); },real_time_monitor_interval);
    

    function _send_command(configobj,paramid,value,clientid=undefined){

        console.log("command -> "+paramid+" : "+value);

        let args=[process.argv[0],process.argv[1],'set-smx-param'];
    
        if (configobj.ipaddress!==undefined){
            args.push(configobj.ipaddress);
        }
        if (configobj.localipaddress!==undefined && configobj.localipaddress!=""){
            args.push("localip="+configobj.localipaddress);
        }
    
        if (paramid.match(/^[0-9]+$/)) {
            args.push(paramid);
        }else{

            console.log("command -> looking for param def");
    
            var commands={};
            let cdata=fs.readFileSync('commands.json',{encoding:'utf8', flag:'r'});
        
            try{
                commands=JSON.parse(cdata);
            }catch(e){
                console.log("command -> error getting param id from param string: "+paramid);
            }
    
            let nc=commands.commands.find(cdf => cdf.name === 'get_smx_param');
                                    
            if (nc!=undefined && nc.hasOwnProperty('definition') && Array.isArray(nc.definition)) {
                let ind=nc.definition.findIndex(o => o.name == paramid );
                if (ind!=-1) {
                    args.push(nc.definition[ind].num);
                }else{
                    console.log("command -> error, not found parameter id: "+paramid);
                }
                
            }else{
                console.log("command -> error, not found parameter id: "+paramid);
                return;
            }
        }
        
        
        args.push(value);
    
        console.log("command -> queue:",args);
    
        let client="";
        if (clientid != undefined){
            client=clientid;
        }    
        command_queue.push({"client":client,"args":args});
    
    }
    
    function mode_control_enabled(configobj){
        return (configobj.energymgmt!=undefined && configobj.energymgmt[0]!=undefined && configobj.energymgmt[0].allow_model_control!=undefined && configobj.energymgmt[0].allow_model_control=="True");
    }


}



//cmd script mode
controllerobject.controller(process.argv,35,1,
    function(result,stateobject){
        if (result==0) {
            if (stateobject !== undefined && stateobject.outobj.constructor === Object && Object.keys(stateobject.outobj).length > 0) {
                
                store.store(stateobject.outobj);

            }    
        }    
        process.exit(result);
    },
    function(log){

        log.forEach(element => {
           console.log(element);   
        });

    }
);



