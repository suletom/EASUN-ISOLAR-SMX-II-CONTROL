const helper = require("./helper.js");
const notifier = require("./notifier.js");

class watchdog { 

    constructor() {
        this.errors=[];
        this.param_missing=[];
    }

    get_current(){

        let ret=[];
        for(let j=0;j<this.errors.length;j++){
    
            
            if (this.errors[j]["goal"] == "notify" && typeof this.errors[j]["notified"] == "undefined"){
                senderrors.push(this.errors[j]);
            }

            let tmp={
                "errordate": helper.fdate(this.errors[j]["date"]),
            };

            if (this.errors[j]["notified"] != undefined ) {
                tmp["notifieddate"]= helper.fdate(this.errors[j]["notified"]);
            }else{
                tmp["notifieddate"]="";
            }

            if (typeof this.errors[j]["lastok"] != 'undefined' && this.errors[j]["lastok"] != undefined ) {
                tmp["lastokdate"]= helper.fdate(this.errors[j]["lastok"]);
            }else{
                tmp["lastokdate"]="";
            }

            if (this.errors[j]["lastpresent"] != undefined ) {
                tmp["lastpresentdate"]= helper.fdate(this.errors[j]["lastpresent"]);
            }else{
                tmp["lastpresentdate"]="";
            }

            ret.push({...this.errors[j],...tmp});

        }

        return ret;
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
            watch=[...configobj.actions];
        }

        //check_param_missing -> always last
        watch.sort(function(a,b){
            
            if ( a["action_check_param_missing"] != undefined){
                
                return 1;
            }
           
            return -1;
        });

        for(let i=0;i<watch.length;i++){
            let w=watch[i];
            
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
                
                thisobj[m[1]](i,currentdata,goal,w);
                
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
            console.log("Param error: ",param," -> undefined",data);
            this.param_missing.push(param+" -> undefined");
        }

        return false;
    }

    check_connection(ind,data,goal,add=null) {
        
        if (this.param_ok("state",data)) {

            if (data.state!="connected"){
                this._pusherror(ind,"Device not available",goal);
            }else{
                this._pushok(ind,"Device not available",goal);
            }

        }

    }

    check_param_missing(ind,data,goal,add=null) {

        if (this.param_missing.length>0) {
            this._pusherror(ind,"Required params missing",goal,this.param_missing.join("; "));
        }else{
            this._pushok(ind,"Required params missing",goal);
        }

    }

    check_fault_code(ind,data,goal,add=null){

        if (this.param_ok("CurrentFault",data)) {
            let errarr=data["CurrentFault"].match(/0: OK/g);
            if (errarr.length!=4) {
                this._pusherror(ind,"Fault code",goal,data["CurrentFault"]);
            }else{
                this._pushok(ind,"Fault code",goal,data["CurrentFault"]);
            }
        }

    }

    check_numeric_value_ui(){
        return {"param": {"type": "string", "title": "Parameter", "$ref": "#/definitions/inverterparam"},
                "min": { "type": "number", "title": "min" },
                "max": { "type": "number", "title": "max" } 
            };
    }

    check_numeric_value(ind,data,goal,add=null){

        if (this.param_ok(add.param,data)) {
            
            if (data[add.param]<add.min || data[add.param]>add.max) {
                this._pusherror(ind,"Param "+add.param+" value not in range",goal,data[add.param]+" not between "+add.min+" - "+add.max );
            }else{
                this._pushok(ind,"Param "+add.param+" value not in range",goal);
            }
        }

    }

    _pusherror(ind,err,goal,info=null){
        
        let seen=this.errors.findIndex(function(el){ return el.error==ind+". "+err; });
        
        if (this.errors[seen] !=undefined && typeof this.errors[seen]["notified"] != "undefined"){
            
            if (this.errors[seen]["present"]!=undefined){
                this.errors[seen]["present"]+=1;
            }else{
                this.errors[seen]["present"]=1;
            }

            this.errors[seen]["lastpresent"]=helper.unixTimestamp();
            
        }else{
            this.errors.push({"error":ind+". "+err,"date":helper.unixTimestamp(),"goal": goal,"info": info,"present": 1,"lastpresent": helper.unixTimestamp(),"ok":0 });
        }    
        
    }

    _pushok(ind,err,goal,info=null){
       
        for(let i=0; i<this.errors.length;i++){
            if (this.errors[i]["error"]==ind+". "+err){
                if (this.errors[i]["ok"]==undefined){
                    this.errors[i]["ok"]=1;
                }else{
                    this.errors[i]["ok"]+=1;
                }
                this.errors[i]["lastok"]=helper.unixTimestamp();
            }
        }
        
    }

    truncate(){
        this.errors=[];
    }

}

module.exports=watchdog;