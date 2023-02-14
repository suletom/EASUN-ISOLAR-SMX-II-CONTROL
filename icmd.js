const controllerobject = require("./modules/controller.js");

controllerobject.controller(process.argv,30,
    function(result,log){
        log.forEach(function(el){
            console.log(...el);
        });
        process.exit(result);
    }
);   