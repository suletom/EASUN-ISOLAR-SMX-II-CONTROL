let fs = require('fs');
const helper = require("./helper.js");

class paramstorage { 

    constructor() {
        this.currentdata={};
        this.history=[];
        this.current_data_store="currentdata.json";
        this.history_store="history";
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
                console.error(err);
            }
        }    

        //store current available data in every case
        console.log("Wiriting data history stucture...");
        this.storehistory();

    }

    storehistory(){

        let date0=new Date();
        let year=date0.getFullYear();
        let mon=date0.getMonth()+1;
        let day=date0.getDate();
        let hour=date0.getHours();
        let min=date0.getMinutes();
        let sec=date0.getSeconds();

        mon=mon.toString().padStart(2,"0");
        day=day.toString().padStart(2,"0");
        hour=hour.toString().padStart(2,"0");
        min=min.toString().padStart(2,"0");
        sec=sec.toString().padStart(2,"0");

        try {
            if (!fs.existsSync(this.history_store)){
                fs.mkdirSync(this.history_store);
            }
        } catch (err) {
            console.error(err);
        }

        try {
            if (!fs.existsSync(this.history_store+"/"+year+"-"+mon)){
                fs.mkdirSync(this.history_store+"/"+year+"-"+mon);
            }
        } catch (err) {
            console.error(err);
        }

        try {
            if (!fs.existsSync(this.history_store+"/"+year+"-"+mon+"/"+day)){
                fs.mkdirSync(this.history_store+"/"+year+"-"+mon+"/"+day);
            }
        } catch (err) {
            console.error(err);
        }

        try {
            fs.writeFileSync(this.history_store+"/"+year+"-"+mon+"/"+day+"/"+hour+"_"+min+"_"+sec+".json",JSON.stringify(this.currentdata));
        } catch (err) {
            console.error(err);
        }

    }

}

module.exports=paramstorage;