const controllerobject = require("./modules/controller.js");
const httpdash = require("./modules/httpdash.js");
let fs = require('fs');
var express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth')



if (process.argv.length<3){

    console.log("\nNo command supplied! To explore modbus debug options or test from command line, use: npm start help\nStarting web ui mode....\n");


    let config=fs.readFileSync('config.json',{encoding:'utf8', flag:'r'});
    let configobj={};

    try{
        configobj=JSON.parse(config);
    }catch(e){
        console.log(e);
        
    }

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
       
    console.log(__dirname+"/node_modules/bootstrap/dist/");
    console.log(express.static(__dirname+"/node_modules/bootstrap/dist/"));
    app.use('/static', express.static(__dirname+"/node_modules/bootstrap/dist/"));


    app.post('/saveconfig',function (req, res) {

        console.log("save:",req.body);
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

    app.get('/query', function (req, res) {

        let args=[process.argv[0],process.argv[1],'get-smx-param'];

        if (configobj.ipaddress!==undefined){
            args.push(configobj.ipaddress);
        }
        if (configobj.localipaddress!==undefined && configobj.localipaddress!=""){
            args.push("localip="+configobj.localipaddress);
        }
        console.log(args);

        controllerobject.controller(args,30,0,
            function(result,stateobject){
                if (result==0){
                    res.json(stateobject.outobj);
                }else{
                    res.json({"rv": 0});
                }

                res.send();
            },
            function(log){
                 log.forEach(element => {
                    console.log(element);   
                 });
                 
            }
        );

        

    });

    let port=6789;
    app.listen(6789, function () {

        console.log("Web ui running on port "+port+"! Access: http://localhost:"+port);

    });
    
}    

controllerobject.controller(process.argv,23,1,
    function(result,stateobject){
        if (result==0) {
            if (objstateobject !== undefined && stateobject.outobj.constructor === Object && Object.keys(stateobject.outobj).length > 0) {
                
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