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

    let port=6789;
    app.listen(6789, function () {

        console.log("Web ui running on port "+port+"! Access: http://localhost:"+port);

    });
    
}    

controllerobject.controller(process.argv,30,
    function(result){
        process.exit(result);
    },
    function(log){
         log.forEach(element => {
            console.log(element);   
         });
         
    }
);   