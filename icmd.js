const controllerobject = require("./modules/controller.js");
const httpdash = require("./modules/httpdash.js");
let fs = require('fs');
var express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth')



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

    let monitor_interval=null;
    let client_seen=unixTimestamp();
    let command_queue=[];

    var app = express();

    if (configobj["password"]!==undefined) {
        console.log("Using web auth: admin/"+configobj["password"]);
        app.use(basicAuth({
            users: { 'admin': configobj["password"] },
            unauthorizedResponse: function(){ return "Provide admin user password to continue!";},
            challenge: true
        }));
    };

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
       
    
    app.use('/static', express.static(__dirname+"/node_modules/bootstrap/dist/"));
    
    app.post('/saveconfig',function (req, res) {

        console.log("save:",req.body);
        
        configobj=req.body;
        console.log("Apply config:", configobj);

        try {
            fs.writeFileSync('config.json',JSON.stringify(req.body));
        } catch (err) {
            console.error(err)
            res.json({"rv": 0,"msg":"Error!"});
        } 

        res.json({"rv": 1,"msg":"Save ok!"});

    });

    app.get('/', function (req, res) {

        res.send(httpdash.httpdash(req,configobj));

    });

    app.post('/set', function (req, res) {

        console.log("Parameter set called:");
        //console.log(req.body);

        let inp=req.body;

        if ( inp.paramid!=undefined && (inp.value!=undefined) ){

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

            command_queue.push(args);

            res.json({"rv": 1,"msg": "Operation queued!"});

            
        }else{
            res.json({"rv": 0,"msg":"Param Error!"});
        }

    });

    app.get('/query', function (req, res) {

        client_seen=unixTimestamp();

        let dov={};
        let data="";        

        try{
            data=fs.readFileSync('currentdata.json',{encoding:'utf8', flag:'r'});
        }catch(e) {

        }

        
        try{
            dov=JSON.parse(data);
        }catch(e){
                        
        }

        res.json(dov);
        
    });

    let port=6789;
    app.listen(6789, function () {

        console.log("Web ui running on port "+port+"! Access: http://localhost:"+port);

    });

    monitor_lock=0;
    monitor_current_object={};

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

        controllerobject.controller(args,25,prio,
            function(result,stateobject){
                if (result==0){
                    
                    if (stateobject !== undefined && stateobject.outobj.constructor === Object && Object.keys(stateobject.outobj).length > 0) {
                        console.log("Wiriting data to json file...");
                        
                        monitor_current_object={...monitor_current_object,...stateobject.outobj};
                        
                        try {
                            fs.writeFileSync('currentdata.json',JSON.stringify(monitor_current_object));
                        } catch (err) {
                            console.error(err)
                        }
        
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

    let cv=0;

    function scheduler(){

        console.log(unixTimestamp());

        if (command_queue.length>0){

            if (monitor_lock==0){

                monitor_lock==1;

                let args=command_queue.shift();

                controllerobject.controller(args,5,0,
                    function(result,stateobject){

                        monitor_lock==0;

                        if (result==0){
                            console.log("Modify OK!",args);
                        }else{
                            console.log("Modify Error!",args);
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

        if (client_seen<unixTimestamp()-60){
            if ((cv%10)!=0) {
                console.log("Low freq, querying later");
                cv++;
                return;
            }
        }

        console.log("Scheduler run...",cv);
        if (cv%20 == 0) {
            console.log("Running long query");
            if (monitor(0)){
                cv=1;
            }else{
                console.log("Still in progress");
            }
            
        }else{
            console.log("Running fast query");
            if (monitor(1)){
                cv++;
            }else{
                console.log("Still in progress");
            }
        }
        

    }

    monitor_interval=setInterval(function(){ scheduler(); },8000);
    
}

controllerobject.controller(process.argv,23,1,
    function(result,stateobject){
        if (result==0) {
            if (stateobject !== undefined && stateobject.outobj.constructor === Object && Object.keys(stateobject.outobj).length > 0) {
                
                try {
                    fs.writeFileSync('currentdata.json',JSON.stringify(stateobject.outobj));
                } catch (err) {
                    console.error(err)
                }

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


function unixTimestamp () {  
    return Math.floor(Date.now() / 1000)
}