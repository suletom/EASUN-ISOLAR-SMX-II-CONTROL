const helper = require("./helper.js");

class battery { 
    
    static calcsoc(capacity_ah,added_consuption_w,historydata){
        

        let out="";

        let found_full=0;
        for (let i=historydata.length-1;i>=0;i--) {
            if (historydata[i]['BatteryVoltage']==historydata[i]['BatteryBoostChargeVoltage']) {
                console.log("BATTERYMODEL Last boost state: "+helper.fdate(historydata[i]['timestamp']));
                found_full=i;
                break;
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

                console.log("BATTERYMODEL Init time: "+helper.fdate(init_time));
                console.log("BATTERYMODEL Values at full: charge: "+charge+" discharge:"+discharge);

            }else{
                
                //find counter resets at midnight
                if (historydata[j-1]['BatteryChargeOnTheDay']>=historydata[j]['BatteryChargeOnTheDay'] &&
                    historydata[j-1]['BatteryDischargeOnTheDay']>historydata[j]['BatteryDischargeOnTheDay']
                ){
                    console.log("BATTERYMODEL Found counter reset after: "+helper.fdate(historydata[j-1]['timestamp']));
                    console.log("BATTERYMODEL Counter values before reset: charge:"+historydata[j-1]['BatteryChargeOnTheDay']+
                          " discharge:"+historydata[j-1]['BatteryDischargeOnTheDay']);
                    
                          //calcah=-111  init_charge: 122  -> 122-111=111
                    charge=(historydata[j-1]['BatteryChargeOnTheDay']-charge); // 5 -> 15 15-5 -> 10
                    discharge=(historydata[j-1]['BatteryDischargeOnTheDay']-discharge);

                }

                calcah=(historydata[j]['BatteryChargeOnTheDay']-charge)-
                       (historydata[j]['BatteryDischargeOnTheDay']-discharge);

                console.log("BATTERYMODEL "+helper.fdate(historydata[j]['timestamp'])+
                    " Ah: -> "+calcah+" ch:"+historydata[j]['BatteryChargeOnTheDay']+
                    " dis:"+historydata[j]['BatteryDischargeOnTheDay']+
                    " ch:"+charge+" dis:"+discharge);

            }

        }

        console.log("BATTERYMODEL Calculated final ah: "+calcah);

        //out+="Calculated final ah with self consuption: "+calcah;

        //helper.unixTimestamp();
        //added_consuption_w

        let soc=Math.round((calcah/capacity_ah)*100);
        console.log("BATTERYMODEL Calculated soc: "+soc);

        console.log(out);
        let rv=(found_full?1:0);

        return {"rv": rv ,"soc":soc};

    }

}

module.exports=battery;