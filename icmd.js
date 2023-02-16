const controllerobject = require("./modules/controller.js");
const httpdash = require("./modules/httpdash.js");
var express = require('express');


if (process.argv.length<3){

    console.log("\nNo command supplied! To explore modbus debug options or test from command line, use: npm start help\nStarting web ui mode....\n");

    var app = express();

    console.log(__dirname+"/node_modules/bootstrap/dist/");
    console.log(express.static(__dirname+"/node_modules/bootstrap/dist/"));
    app.use('/static', express.static(__dirname+"/node_modules/bootstrap/dist/"));

    app.get('/', function (req, res) {

        res.send(httpdash.httpdash(req));

    });

    app.get('/query', function (req, res) {

        let args=[process.argv[0],process.argv[1],'get-smx-param'];
        if (req.query.ipaddress!==undefined){
            args.push(req.query.ipaddress);
        }
        if (req.query.localip!==undefined){
            args.push("localip="+req.query.localip);
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