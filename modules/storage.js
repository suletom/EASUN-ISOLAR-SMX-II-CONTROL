let fs = require('fs');
const helper = require("./helper.js");

class paramstorage { 

    constructor() {
        this.currentdata={};
        this.history=[];
        this.current_data_store="currentdata.json";
        this.lastwrite=null;
    }

    get(){

        let ret={};
        if (this.history.length==0 || this.currentdata["lastseen"]<helper.unixTimestamp()-60){
            this.currentdata["state"]="notconnected";
        }else{
            ret=this.currentdata;
        }
        
        return ret;
    }

    store(jsobject,completedata=0){
        
        jsobject["timestamp"]=helper.unixTimestamp();
        jsobject["state"]="connected";
        jsobject["lastseen"]=jsobject["timestamp"];
        
        //0->full prio
        if (completedata==0){
            this.currentdata=jsobject;
        }else{
            this.currentdata={...this.currentdata,...jsobject};
        }

        if (this.history.length>0){
            //hold past 2 days in memory
            let da=helper.unixTimestamp() - 48 * 3600 * 1000;
            while(this.history[0].timestamp<da){
                this.history.shift();
            }
            
        }
        
        this.history.push(this.currentdata);
        
        if (this.lastwrite==null || completedata==0){
            console.log("Wiriting data to json file...");
            this.lastwrite=helper.unixTimestamp();
            try {
                fs.writeFileSync(this.current_data_store,JSON.stringify(this.currentdata));
            } catch (err) {
                console.error(err)
            }
        }    

    }

}

module.exports=paramstorage;