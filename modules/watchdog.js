const notifier = require("./modules/notifier.js");

const watchdog = function(configobj,currentdata){

    let errors=[];

    function param_ok(param,data){

        //check if exists
        if (data[param]!==undefined){

            if (data[param]!="N/A"){
                return true;
            }else{
                console.log("Param error: ",param," -> ",data[param]);
            }

        }

        return false;
    }

    function check_connection(data){
        
        if (data.state!="connected"){
            errors.push({"error":"Device not available","date":unixTimestamp()});
        }

    }


    function unixTimestamp (d=null) {  
        let bd=Date.now();
        if (d!==null){
            bd=d;
        }
        return Math.floor(bd / 1000)
    }

}

exports.watchdog=watchdog;