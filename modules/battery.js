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
        let calcah_reset=0;

        let chinit=0;
        let dischinit=0;
        let dischargetime=0;
        let dch_reset=0;
       
        for (let j=found_full;j<historydata.length;j++) {

            if (charge==-1 && discharge==-1){

                charge=historydata[j]['BatteryChargeOnTheDay'];
                discharge=historydata[j]['BatteryDischargeOnTheDay'];
                init_time=historydata[j]['timestamp'];
                dischinit=init_time;
                
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

        let finalah=capacity_ah+calcah;

        console.log("BATTERYMODEL Calculated final ah: "+finalah);
        
        let soc=Math.round((finalah/capacity_ah)*100);
        console.log("BATTERYMODEL Calculated soc: "+soc);

        console.log(out);
        let rv=(found_full?1:0);

        return {"rv": rv ,"soc":soc,"dischargetime":dischargetime};

    }

}

module.exports=battery;