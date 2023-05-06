const helper = require("./helper.js");
const fs = require('fs');
  

class jbdbattery {
  
    static calcsoc=function(filename="jbdinfo"){
        
        let errorinfo=[];
        let finalah=0;

        let statsobj={};
        let fdata="";
        try{
            statsobj = fs.statSync(filename);
        }catch(error){
            console.log("JBDBATTERY:",error);
            errorinfo.push("File stat failed: "+filename);
        }

        try{
            fdata = fs.readFileSync(filename,{ encoding: 'utf8', flag: 'r' });
        }catch(error){
            console.log("JBDBATTERY:",error);
            errorinfo.push("File read failed: "+filename);
        }

        let mtime=helper.unixTimestamp(new Date(statsobj.mtime));
        if (mtime<helper.unixTimestamp()-300){
            console.log("JBDBATTERY:",error);
            errorinfo.push("Batteryinfo file too old: "+filename);
        }
        //          meter, volts,amps,watts,remain,capacity,cycles
        //maininfo: jbdbms,26.61,0.00,0.00, 200,   220,     129
        let arr=fdata.split(",");

        if (arr.length!=7){
            errorinfo.push("Batteryinfo wrong data!");
        }


        let batteryvoltage=arr[1];
        finalah=parseInt(arr[4]);
        let capacity=parseInt(arr[5]);
        let cycles=parseInt(arr[6]);
        let amps=parseFloat(arr[2]);
        let soc=Math.round((finalah/capacity)*100);
        
        let rv=(errorinfo.length>0?0:1);

        let remain=0;
        let state="charging";
        if (arr[2]<0){
            state="discharging";
            let current_consuption=Math.abs(amps);
            remain=((finalah)/Math.abs(current_consuption)).toFixed(2);
        }

        return {
        "rv": rv,
        "ah_left": (finalah.toFixed(1)), 
        "remaining": remain,
        "soc":soc,
        
        "errors":errorinfo,
        "state":state,
        "capacity": capacity,
        "batteryvoltage": batteryvoltage,
        "cycles": cycles,
        "amps": amps
        };

    };

}

module.exports=jbdbattery;