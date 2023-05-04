const helper = require("./helper.js");

class jbdbattery {
  
    static calcsoc=function(ble_address){
        
        let errorinfo=[];
        let finalah=0;
        let capacity_ah=0;

     
        let soc=Math.round((finalah/capacity_ah)*100);
        
        let rv=(errorinfo.length>0?0:1);

        let state="charging";
        
        //    state="discharging";


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