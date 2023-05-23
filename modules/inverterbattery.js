const helper = require("./helper.js");

class battery {

    static checkp=function(p){
        if (p!==undefined && p!==null && p!=="N/A"){
            if (Number(p) === p){
                return true;
            }
        }
        return false;
    };
    
    static calcsoc=function(currentdata){
        
        if (!this.checkp(currentdata['BatterySOC'])){
            errorinfo.push("No BatterySOC info in history");
        }
       
        let info="";
        if (rv==1){
            info+=soc+"% "+state+((remain!=0)?(" Remaining hours: "+remain):"")+" "+(finalah.toFixed(1)+" Ah left");
        }else{
            info+=errorinfo.join("; ");
        }

        return {
        "rv": rv,
        "capacity_ah": capacity_ah,
        "ah_left": (finalah.toFixed(1)), 
        "remaining": remain,
        "soc":soc,
        "dischargetime":dischargetime,
        "current_consumption_a": current_consuption,
        "errors":errorinfo,
        "state":state,
        "info": info
        };

    };

}

module.exports=battery;