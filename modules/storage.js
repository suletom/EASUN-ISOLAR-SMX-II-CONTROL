let fs = require('fs');
const { exit } = require('process');
const helper = require("./helper.js");

class paramstorage { 

    constructor() {
        this.currentdata={};
        this.history=[];
        this.current_data_store="currentdata.json";
        this.history_store="history";
        this.lastwrite=null;
        this.history_days=8;
        this.asyncdata=[];

        console.log("Loading recent history from files...");
        this.loadhistory();
  
    }

    loadhistory(){
        
        let now=helper.unixTimestamp();
        let ts=now-(3600*24*this.history_days);
        
        let tmpdata=[];

        while(ts<=now) {
            
            let dateobj=helper.fdateobj(ts);
            let dn=this.history_store+"/"+dateobj.year+"-"+dateobj.mon+"/"+dateobj.day+"/";

            //dateobj.hour+"_"+dateobj.min+"_"+dateobj.sec+".json";

            let dircontent=[];

            console.log("Reading dir: "+dn);
            try{
                dircontent=fs.readdirSync(dn);
            }catch(e){
                console.log("Dir cound not be read:"+dn);
            }
         
            dircontent.sort();

            for(let i=0;i<dircontent.length;i++){
                
                if (fs.existsSync(dn+dircontent[i])){
               
                    let data="";
                    try{
                        //console.log("Parseing file: "+dn+dircontent[i]);
                        //console.log(dn+dircontent[i]);
                        data=fs.readFileSync(dn+dircontent[i],{encoding:'utf8', flag:'r'});
                    }catch(e){
                        console.log(e);
                    }
                    let dataobj={};
    
                    try{
                        dataobj=JSON.parse(data);
                    }catch(e){
                        console.log(e);
                    }

                    tmpdata.push(dataobj);
    
                }

            }
           
            ts=ts+(24*3600);

        }
        console.log("Read: "+tmpdata.length+" files");
        
        this.history=tmpdata;

        //for (let i=0;i<tmpdata.length;i++){
        //    console.log(helper.fdate(tmpdata[i]['timestamp']));
        //}
    }

    get(){

        let ret={};
        //after 200 sec -> set notconnected state
        if (this.history.length==0 || this.currentdata["lastseen"]<helper.unixTimestamp()-200){
            this.currentdata["state"]="notconnected";
        }
        ret=this.currentdata;

        return JSON.parse(JSON.stringify(ret));
    }

    gethistory(){
        return this.history;
    }

    store(jsobject,completedata=0,append=null){
        
        if (append!=null) {
            jsobject={...jsobject,...append};
        }

        

        jsobject["timestamp"]=helper.unixTimestamp();
        jsobject["state"]="connected";
        jsobject["lastseen"]=jsobject["timestamp"];
        if (jsobject["battery_seen"]===undefined){
            if (this.currentdata["battery_seen"]!==undefined){
                jsobject["battery_seen"]=this.currentdata["battery_seen"];
            }
        }
        
        //0->full prio
        if (completedata==0){

            if (this.asyncdata.length>0) {
                this.asyncdata.forEach(function(el) {
                    if (jsobject["asyncdata"]!=undefined) {
                        jsobject.asyncdata.push(el);
                    } else {
                        jsobject["asyncdata"]=[];
                        jsobject["asyncdata"].push(el);
                    }
                });
                this.asyncdata=[];
            }

            this.currentdata=jsobject;

        }else{
            this.currentdata={...this.currentdata,...jsobject};
        }
        
        if (this.history.length>0){
            //hold past 8 days in memory
            let da=helper.unixTimestamp() - (24 * 3600 * this.history_days);
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

    appendasync(data) {
        this.asyncdata.push(data);
    }

}

module.exports=paramstorage;