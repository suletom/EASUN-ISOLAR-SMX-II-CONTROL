const helper = require("./helper.js");

class battery { 
    
    calcsoc(capacity_ah,added_consuption_w,historydata){

        let out="";

        let found_full=0;
        for (let i=historydata.length;i>=0;i--) {
            if (historydata[i]['BatteryVoltage']==historydata[i]['BatteryBoostChargeVoltage']) {
                out+="Last boost state: "+helper.fdate(historydata[i]['timestamp'])+"\n";
                found_full=i;
            }
        }

        let charge=-1;
        let discharge=-1;
        let init_time=0;

        let calcah=0;
       
        for (let j=found_full;j<historydata.length;j++) {

            if (charge==-1 && discharge==-1){

                charge=historydata[j]['BatteryChargeOnTheDay'];
                discharge=historydata[j]['BatteryDischargeOnTheDay'];
                init_time=historydata[j]['timestamp'];

                out+="Init time: "+helper.fdate(init_time)+"\n";
                out+="Values at full: charge: "+charge+" discharge:"+discharge+"\n";

            }else{
                
                //find counter resets at midnight
                if (historydata[j-1]['BatteryChargeOnTheDay']>=historydata[j]['BatteryChargeOnTheDay'] &&
                    historydata[j-1]['BatteryDischargeOnTheDay']>historydata[j]['BatteryDischargeOnTheDay']
                ){
                    out+="Found counter reset at: "+helper.fdate(historydata[i]['timestamp'])+"\n";
                    out+="Counter values before reset: charge:"+historydata[j-1]['BatteryChargeOnTheDay']+
                          " discharge:"+historydata[j]['BatteryDischargeOnTheDay']+"\n";
                    
                    charge=(historydata[j-1]['BatteryChargeOnTheDay']-charge); // 5 -> 15 15-5 -> 10
                    discharge=(historydata[j-1]['BatteryDischargeOnTheDay']-discharge);
                }

                calcah=(historydata[j]['BatteryChargeOnTheDay']-charge)-
                       (historydata[j]['BatteryDischargeOnTheDay']-discharge);

                out+="Calculated ah: "+helper.fdate(historydata[i]['timestamp'])+" -> "+calcah;

            }

        }

        out+="Calculated final ah: "+calcah;

        //out+="Calculated final ah with self consuption: "+calcah;

        //helper.unixTimestamp();
        //added_consuption_w

        soc=(calcah/capacity_ah)*100;
        out+="Calculated soc: "+soc;
        
        return {"rv": found_full ,"soc":soc,"log":out};

    }

}

module.exports=battery;