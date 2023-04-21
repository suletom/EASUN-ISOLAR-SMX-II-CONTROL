const helper = require("./helper.js");

class battery {

    static checkp(p){
        if (p!==undefined && p!==null && p!=="N/A"){
            if (Number(p) === p){
                return true;
            }
        }
        return false;
    }
    
    static calcsoc(capacity_ah,added_consuption_a,historydata){
        
        //fatal errors
        let errorinfo=[];
        let data_problem_counter=0;
        let found_full=0;
        for (let i=historydata.length-1;i>=0;i--) {

            if (!checkp(historydata[i]['BatteryVoltage'])){
                errorinfo.push("No BatteryVoltage info in history");
            }
            if (!checkp(historydata[i]['BatteryBoostChargeVoltage'])){
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
       
        for (let j=found_full;j<historydata.length;j++) {

            if (charge==-1 && discharge==-1){

                if (!checkp(historydata[j]['BatteryChargeOnTheDay'])){
                    errorinfo.push("No BatteryChargeOnTheDay info in history at full state");
                }
                if (!checkp(historydata[j]['BatteryDischargeOnTheDay'])){
                    errorinfo.push("No BatteryDischargeOnTheDay info in history at full state");
                }
    
                charge=historydata[j]['BatteryChargeOnTheDay'];
                discharge=historydata[j]['BatteryDischargeOnTheDay'];
                init_time=historydata[j]['timestamp'];
                dischinit=init_time;
                
                console.log("BATTERYMODEL Init time: "+helper.fdate(init_time));
                console.log("BATTERYMODEL Values at full: charge: "+charge+" discharge:"+discharge);

            }else{

                if (!checkp(historydata[j]['BatteryChargeOnTheDay']) || !checkp(historydata[j]['BatteryDischargeOnTheDay'])){
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

        
        let rv=(errorinfo.length>0?0:1);

        return {"rv": rv ,"soc":soc,"dischargetime":dischargetime,"errors":errorinfo};

    }

}

module.exports=battery;