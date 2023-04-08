const helper = require("./helper.js");
const notifier = require("./notifier.js");

class watchdog { 

    constructor() {
        this.errors=[];
        this.param_missing=[];
    }

    get_ui_schema(){

        let fns=Object.getOwnPropertyNames( watchdog.prototype );
       
        let conds=[];
        let sch=[];

        for(let i=0;i<fns.length;i++){
            let fn=fns[i];
            let m=fn.match(/^check_(.*)$/);
            let m2=fn.match(/^check_(.*)_ui$/);
            if (m && !m2) {

                let addprops="";
                if (typeof this[fn+"_ui"] == "function" ){
                    addprops=this[fn+"_ui"]();
                }

                let aa="action_"+fn;

                let po={};
                po[aa]= {
                        "title": "action-"+fn,
                        "type": "string",
                        "enum": ["log","notify"]
                    
                };

                if (addprops!="") po={...po,...addprops};

                sch.push({
                    "title": fn,
                    "type": "object",
                    "id": fn,
                    "properties": po
                    }
                );
                
            }
            
        }

        return sch;

    }

    run(configobj,currentdata){

        this.param_missing=[];

        let thisobj=this;

        let watch=[];

        if (typeof configobj["actions"] != undefined) {
            watch=configobj.actions;
        }

        for(let i=0;i<watch.length;i++){
            let w=watch[i];
            console.log(w);

            let m="";
            let goal="";
            for (const [key, value] of Object.entries(w)) {
                m=key.match(/^action_(.*)$/);
                if (m) {
                    goal=value;
                    break;
                } 
            }
            
            if (m!=="" && typeof thisobj[m[1]] === 'function'){
                console.log("checking: "+m[1]);
                
                thisobj[m[1]](currentdata,goal,w);
                
            }
        };

        if (this.errors.length==0){
            console.log("-------->>>> WATCHDOG: ALL GOOD! :) --------");
        }else{
            console.log("-------->>>> WATCHDOG:");

            let senderrors=[];
            for(let j=0;j<this.errors.length;j++){
                if (this.errors[j]["goal"] == "notify" && typeof this.errors[j]["notified"] == "undefined"){
                    senderrors.push(this.errors[j]);
                    this.errors[j]["notified"]=helper.unixTimestamp();
                }
            }

            if (senderrors.length>0){
                let started=notifier.notifier(configobj,"SOLAR ALERT "+configobj.ipaddress,JSON.stringify(this.errors));
                console.log("Sending errors:",senderrors);
            }
            
            this.errors=this.errors.filter(function(el){
                return el["date"]>helper.unixTimestamp()-(3600*12);
            });
            
            console.log("Current notifications:",this.errors);

        }    
        
    }

    param_ok(param,data){

        //check if exists
        if (data[param]!==undefined){

            if (data[param]!="N/A"){
                return true;
            }else{
                console.log("Param error: ",param," -> ",data[param]);
                this.param_missing.push(param+" -> "+data[param]);
            }

        }else{
            console.log("Param error: ",param," -> ",data[param]);
            this.param_missing.push(param+" -> "+data[param]);
        }

        return false;
    }

    check_connection(data,goal,add=null) {
        
        if (this.param_ok("state",data)) {

            if (data.state!="connected"){
                this._pusherror("Device not available",goal);
            }

        }

    }

    check_param_missing(data,goal,add=null) {

        if (this.param_missing.length>0) {
            this._pusherror("Required params missing",goal,this.param_missing.join("; "));
        }

    }

    check_fault_code(data,goal,add=null){

        if (this.param_ok("CurrentFault",data)) {
            let errarr=data["CurrentFault"].match(/0: OK/g);
            if (errarr.length!=4) {
                this._pusherror("Fault code",goal,data["CurrentFault"]);
            }
        }

    }

    check_numeric_value_ui(){
        return {"param": { "type": "string", "title": "Parameter" }, "min": { "type": "number", "title": "min" }, "max": { "type": "number", "title": "max" } };
    }

    check_numeric_value(data,goal,add=null){

        if (this.param_ok(add.param,data)) {
            
            if (data[add.param]<add.min || data[add.param]>add.max) {
                this._pusherror("Param "+add.param+" value not in range",goal,data[add.param]+" not between "+add.min+" - "+add.max );
            }
        }

    }

    _unseterror(err){

        let seen=this.errors.find(function(el){ el.error==err; });
    }
  
    _pusherror(err,goal,info=null){
        
        let seen=this.errors.find(function(el){ return el.error==err; });

        if (seen !=undefined && typeof seen["notified"] != "undefined"){
            seen["lastpresent"]=helper.unixTimestamp();
        }else{
            this.errors.push({"error":err,"date":helper.unixTimestamp(),"goal": goal,"info": info });
        }    
        
    }

    truncate(){
        this.errors=[];
    }

}

module.exports=watchdog;