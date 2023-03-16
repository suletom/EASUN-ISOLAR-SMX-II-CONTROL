const notifier = require("./modules/notifier.js");

class watchdog { 

    constructor() {
        this.errors=[];
        this.param_missing=false;
    }

    run(configobj,currentdata,watch){

        
    }

    param_ok(param,data){

        //check if exists
        if (data[param]!==undefined){

            if (data[param]!="N/A"){
                return true;
            }else{
                console.log("Param error: ",param," -> ",data[param]);
                param_missing=true;
            }

        }

        return false;
    }

    check_connection(data) {
        
        if (param_ok("state",data)) {

            if (data.state!="connected"){
                errors.push({"error":"Device not available","date":unixTimestamp()});
            }

        }

    }

    check_param_missing() {

        if (param_missing) {
            errors.push({"error":"Required params missing","date":unixTimestamp()});
        }

    }

    check_fault_code(){

        if (param_ok("CurrentFault",data)) {
            let errarr=data["CurrentFault"].match(/0: OK/);
            if (errarr.length!=4) {
                errors.push({"error":"Fault code","date":unixTimestamp(),"info":data["CurrentFault"]});
            }
        }

    }

    check_numeric_value(param,min,max){

        if (param_ok(param,data)) {
            
            if (data[param]<min || data[param]>max) {
                errors.push({"error":"Param "+param+" value not in range","date":unixTimestamp(),"info":data[param]+" not between "+min+" - "+max });
            }
        }

    }

    unixTimestamp (d=null) {  
        let bd=Date.now();
        if (d!==null){
            bd=d;
        }
        return Math.floor(bd / 1000)
    }

}

module.exports=watchdog;