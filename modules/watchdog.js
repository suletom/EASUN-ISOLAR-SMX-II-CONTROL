const helper = require("./helper.js");
const notifier = require("./notifier.js");

class watchdog { 

    constructor() {
        this.errors=[];
        this.param_missing=false;
    }

    run(configobj,currentdata,watch){

        this.param_missing=false;

        let thisobj=this;

        for(let i=0;i<watch.length;i++){
            let w=watch[i];
            if (typeof thisobj[w.cond] === 'function'){
                if (w.add!=undefined) {
                    thisobj[w.cond](currentdata,w.add);
                }else{
                    thisobj[w.cond](currentdata,w.add);
                }
            }
        };

        if (this.errors.length==0){
            console.log("-------->>>> WATCHDOG: ALL GOOD! :) --------");
        }else{
            console.log("-------->>>> WATCHDOG:");

            let started=notifier.notifier(configobj,"SOLAR ALERT "+configobj.ipaddress,JSON.stringify(this.errors));
            console.log(this.errors);

            if (started) {
                this.errors=[];
            }

        }    
        
    }

    param_ok(param,data){

        //check if exists
        if (data[param]!==undefined){

            if (data[param]!="N/A"){
                return true;
            }else{
                console.log("Param error: ",param," -> ",data[param]);
                this.param_missing=true;
            }

        }

        return false;
    }

    check_connection(data) {
        
        if (this.param_ok("state",data)) {

            if (data.state!="connected"){
                this._pusherror("Device not available");
            }

        }

    }

    check_param_missing(data) {

        if (this.param_missing) {
            this._pusherror("Required params missing");
        }

    }

    check_fault_code(data){

        if (this.param_ok("CurrentFault",data)) {
            let errarr=data["CurrentFault"].match(/0: OK/g);
            if (errarr.length!=4) {
                this._pusherror("Fault code",data["CurrentFault"]);
            }
        }

    }

    check_numeric_value(data,add){

        if (this.param_ok(add.param,data)) {
            
            if (data[add.param]<add.min || data[add.param]>add.max) {
                this._pusherror("Param "+add.param+" value not in range",data[add.param]+" not between "+add.min+" - "+add.max );
            }
        }

    }
  
    _pusherror(err,info=null){
        
        this.errors.push({"error":err,"date":helper.unixTimestamp(),"info": info });
        
    }

}

module.exports=watchdog;