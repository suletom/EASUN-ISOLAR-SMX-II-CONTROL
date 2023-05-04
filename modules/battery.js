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
    
    static calcsoc=function(capacity_ah,added_consuption_a,historydata){
        
        //fatal errors
        let errorinfo=[];
        let data_problem_counter=0;
        let found_full=0;
        for (let i=historydata.length-1;i>=0;i--) {

            if (!this.checkp(historydata[i]['BatteryVoltage'])){
                errorinfo.push("No BatteryVoltage info in history");
            }
            if (!this.checkp(historydata[i]['BatteryBoostChargeVoltage'])){
                errorinfo.push("No BatteryBoostChargeVoltage info in history");
            }

            if (historydata[i]['BatteryVoltage']==historydata[i]['BatteryBoostChargeVoltage']) {
                console.log("BATTERYMODEL Last boost state: "+helper.fdate(historydata[i]['timestamp']));
                found_full=i;
                break;
            }
        }

        if (found_full==0){
            errorinfo.push("Last full state couldn't be determined");
        }

        //if (historydata[found_full]['timestamp']<24*3600*7){
        //    errorinfo.push("Last full state couldn't be determined last full state too old");
        //}

        let charge=-1;
        let discharge=-1;
        let init_time=0;

        let calcah=0;
        let calcah_reset=0;

        let chinit=0;
        let dischinit=0;
        let dischargetime=0;
        let dch_reset=0;
       
        if (found_full>0){
            for (let j=found_full;j<historydata.length;j++) {


                if (historydata[j-1]['timestamp']+300<historydata[j]['timestamp']){
                    errorinfo.push("Missing history data, calculation impossible.");
                    break;
                }

                if (charge==-1 && discharge==-1){

                    if (!this.checkp(historydata[j]['BatteryChargeOnTheDay'])){
                        errorinfo.push("No BatteryChargeOnTheDay info in history at full state");
                        break;
                    }
                    if (!this.checkp(historydata[j]['BatteryDischargeOnTheDay'])){
                        errorinfo.push("No BatteryDischargeOnTheDay info in history at full state");
                        break;
                    }
        
                    charge=historydata[j]['BatteryChargeOnTheDay'];
                    discharge=historydata[j]['BatteryDischargeOnTheDay'];
                    init_time=historydata[j]['timestamp'];
                    dischinit=init_time;
                    
                    console.log("BATTERYMODEL Init time: "+helper.fdate(init_time));
                    console.log("BATTERYMODEL Values at full: charge: "+charge+" discharge:"+discharge);

                }else{

                    if (!this.checkp(historydata[j]['BatteryChargeOnTheDay']) || !this.checkp(historydata[j]['BatteryDischargeOnTheDay'])){
                        data_problem_counter++;
                        continue;
                    }
                                    
                    //find counter resets at midnight
                    if (historydata[j-1]['BatteryChargeOnTheDay']>=historydata[j]['BatteryChargeOnTheDay'] &&
                        historydata[j-1]['BatteryDischargeOnTheDay']>historydata[j]['BatteryDischargeOnTheDay']
                    ){
                        console.log("BATTERYMODEL Found counter reset after: "+helper.fdate(historydata[j-1]['timestamp']));
                        console.log("BATTERYMODEL Counter values before reset: charge:"+historydata[j-1]['BatteryChargeOnTheDay']+
                            " discharge:"+historydata[j-1]['BatteryDischargeOnTheDay']);

                        //charge=(historydata[j-1]['BatteryChargeOnTheDay']-charge);
                        //discharge=(historydata[j-1]['BatteryDischargeOnTheDay']-discharge);

                        calcah_reset=(historydata[j-1]['BatteryChargeOnTheDay']-charge)-
                            (historydata[j-1]['BatteryDischargeOnTheDay']-discharge);

                        console.log("BATTERYMODEL Added ah after reset:"+ calcah_reset);

                        charge=0;    
                        discharge=0;

                    }

                    let lastcalcah=calcah;
                    
                    calcah=calcah_reset+
                        (historydata[j]['BatteryChargeOnTheDay']-charge)-
                        (historydata[j]['BatteryDischargeOnTheDay']-discharge);

                    if (chinit!=0){ //chargeing

                        if (lastcalcah<=calcah){ //charging
                            //not adding time here

                        }else{
                            //set to discharge
                            dischinit=historydata[j]['timestamp'];
                            chinit=0;
                        }

                    }else{

                        if (lastcalcah>=calcah){
                            //discharging
                            dischargetime=dch_reset+historydata[j]['timestamp']-dischinit;
                            
                        }else{
                            //charging
                            if (chinit==0) { //if now started chargeing
                                chinit=historydata[j]['timestamp'];
                                dch_reset=dischargetime;
                            }
                        }
                    }    

                    console.log("BATTERYMODEL "+helper.fdate(historydata[j]['timestamp'])+
                        " Ah: -> "+calcah+" ch:"+historydata[j]['BatteryChargeOnTheDay']+
                        " dis:"+historydata[j]['BatteryDischargeOnTheDay']+" dischargetime: "+dischargetime);

                }

            }
        }

        if (data_problem_counter>10){
            errorinfo.push("Missing data in history exceeds allowed value!");
        }

        let finalah=capacity_ah+calcah;

        console.log("BATTERYMODEL Calculated final ah: "+finalah);
        console.log("BATTERYMODEL Calculated discharge time sec: "+dischargetime);
        
        finalah=finalah-((dischargetime/3600)*added_consuption_a);

        console.log("BATTERYMODEL Calculated final ah with added discharge: "+finalah);

        let soc=Math.round((finalah/capacity_ah)*100);
        console.log("BATTERYMODEL Calculated soc: "+soc);

        if (!this.checkp(historydata[historydata.length-1]["BatteryCurrent"])){
            errorinfo.push("BatteryCurrent value missing!");
        }

        let rv=(errorinfo.length>0?0:1);

        let diff=0;
        if (soc>101){
            diff=soc-100;
            errorinfo.push("!!Calculation inaccurate: "+(diff)+"% diff.");
        }

        let remain=0;
        let state="charging";
        let current_consuption=0;
        if (historydata[historydata.length-1]["BatteryCurrent"] >= 0){
            state="discharging";
            current_consuption=(historydata[historydata.length-1]["BatteryCurrent"]+added_consuption_a);
            remain=((finalah)/current_consuption).toFixed(2);

        }else{

        }

        return {
        "rv": rv,
        "ah_left": (finalah.toFixed(1)), 
        "remaining": remain,
        "soc":soc,
        "dischargetime":dischargetime,
        "current_consumption_a": current_consuption,
        "errors":errorinfo,
        "state":state
        };

    };

}

module.exports=battery;