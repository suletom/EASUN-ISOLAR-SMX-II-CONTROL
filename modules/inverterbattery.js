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
    
    static calcsoc=function(capacity_ah,added_consuption_a,currentdata){
        
        let errorinfo=[];
 
        if (!this.checkp(currentdata['BatteryCurrent'])){
            errorinfo.push("No BatteryCurrent info in current data!");
        }

        let soc=0;

        if (!this.checkp(currentdata['BatterySoc'])){
            errorinfo.push("No BatterySoc info in current data!");
        }else{
            soc=currentdata['BatterySoc'];
        }


        if (!this.checkp(currentdata['PVPower'])){
            errorinfo.push("No PVPower info in current data!");
        }

        


        let rv=1;
        let info="";
        if (errorinfo.length>0){
            rv=0;
            info=errorinfo.join("; ");
        }


        let current_consumption=((-1*currentdata['BatteryCurrent'])-added_consuption_a);
        if (currentdata['PVPower']>0) {
            current_consumption=-1*(currentdata['BatteryCurrent']);
        }

        return {
        "rv": rv,
        "soc":soc,
        "current_consumption_a": current_consumption,
        "capacity_ah": capacity_ah,
        "info": info
        };

    };

}

module.exports=battery;