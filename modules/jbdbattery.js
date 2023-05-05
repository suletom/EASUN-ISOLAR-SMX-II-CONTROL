const helper = require("./helper.js");
const fs = require('fs');
  

class jbdbattery {
  
    static calcsoc=function(filename){
        
        let errorinfo=[];
        let finalah=0;
        let capacity_ah=0;

        let statsobj={};
        let fdata="";
        try{
            statsobj = fs.statSync(filename);
        }catch(error){
            console.log("JBDBATTERY:",error);
        }

        try{
            fdata = fs.readFileSync(filename,{ encoding: 'utf8', flag: 'r' });
        }catch(error){
            console.log("JBDBATTERY:",error);
        }

        if (statsobj.mtime!==undefined){
            let mtime=helper.unixTimestamp(new Date(statsobj.mtime));

        }else{
            
        }
     
        let soc=Math.round((finalah/capacity_ah)*100);
        
        let rv=(errorinfo.length>0?0:1);

        let state="charging";

        return {
        "rv": rv,
        "ah_left": (finalah.toFixed(1)), 
        "remaining": remain,
        "soc":soc,
        "dischargetime":dischargetime,
        "errors":errorinfo,
        "state":state
        };

    };

}

module.exports=battery;