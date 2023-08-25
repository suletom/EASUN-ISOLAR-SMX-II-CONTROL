const energy_ver1 = require("./energy_ver1.js");
const forecast = require("./forecast.js");
const helper = require("./helper.js");
const notifier = require("./notifier.js");

class energymodels{

    constructor() {
        this.modelresults=[];
    }    

    static get_ui_schema=function(){

        let sch=[];
       
        sch.push({
            "title": "Maximum SOLAR with maintained backup using forecast.solar prediction",
            "type": "object",
            "id": "energymodel1",
            "properties": {
                "model_chosen": {
                    "type": "string",
                    "title": "Type",
                    "enum": ["energymodel1"]
                },
                "min_point": {
                    "type": "number",
                    "title": "Battery minimum SOC for calculations",
                    
                },
                "switch_point": {
                    "type": "number",
                    "title": "Battery absolute minimum SOC (where we switch to UTI)",
                    
                },
                "charge_point": {
                    "type": "number",
                    "title": "Battery absolute minimum SOC (where battery charge is turned on)",
                    
                },
                "preserve_point": {
                    "type": "number",
                    "title": "Minimum SOC to swith to UTI when prediction won't be enough",
                    
                }
                
            }
        });

        return sch;
    }

    get_current(){

        let out="";
        if (this.msg!=undefined && this.msg!=""){
            out=this.msg;
        }
        return out;

    }

    run(configobj,currentdata,history,nowtime="") {

        if (nowtime==""){
            nowtime=helper.unixTimestamp();
        }

        let prediction=null;
        if (typeof configobj["forecast_url"] != undefined) {
            prediction=forecast.getforecast(configobj["forecast_url"]);
        }

        if (prediction==null){
            console.log("ENERGY_ERROR:","Prediction empty!");
            this.msg="ENERGY_ERROR: Prediction empty!";
            return false;
        }else{


            if (typeof configobj["energymgmt"] != undefined && typeof configobj["energymgmt"][0] != undefined && typeof configobj["energymgmt"][0]["model_chosen"] != undefined ) {

                if (configobj["energymgmt"][0]["model_chosen"]=="energymodel1") {

                    if (currentdata["battery_rv"]!=undefined && currentdata["battery_rv"]==1) {

                        if (
                            configobj["energymgmt"][0]["min_point"] != undefined &&
                            configobj["energymgmt"][0]["switch_point"] != undefined &&
                            configobj["energymgmt"][0]["charge_point"] != undefined && 
                            configobj["energymgmt"][0]["preserve_point"] != undefined ){
                                if ( configobj["energymgmt"][0]["min_point"]<100 && configobj["energymgmt"][0]["min_point"]>0 &&
                                    configobj["energymgmt"][0]["switch_point"]<100 && configobj["energymgmt"][0]["switch_point"]>0 &&
                                    configobj["energymgmt"][0]["charge_point"]<100 && configobj["energymgmt"][0]["charge_point"]>0 &&
                                    configobj["energymgmt"][0]["min_point"] > configobj["energymgmt"][0]["switch_point"] &&
                                    configobj["energymgmt"][0]["switch_point"] > configobj["energymgmt"][0]["charge_point"] &&
                                    configobj["energymgmt"][0]["preserve_point"]>0 && 
                                    configobj["energymgmt"][0]["preserve_point"]<100
                                ){

                                    let ah_min_point=currentdata["battery_capacity_ah"]*((configobj["energymgmt"][0]["min_point"])/100);
                                    let ah_switch_point=currentdata["battery_capacity_ah"]*((configobj["energymgmt"][0]["switch_point"])/100);
                                    let ah_charge_point=currentdata["battery_capacity_ah"]*((configobj["energymgmt"][0]["charge_point"])/100);
                                    let ah_preserve_point=currentdata["battery_capacity_ah"]*((configobj["energymgmt"][0]["preserve_point"])/100);

                                    //here begins the magic
                                    let energy=new energy_ver1();
                                    
                                    let modelresult=energy.run(nowtime,null,prediction,
                                        ah_min_point,
                                        ah_switch_point,  
                                        ah_charge_point,
                                        ah_preserve_point,
                                        currentdata["battery_ah_left"],
                                        currentdata["OutputPriority_text"],
                                        currentdata["battery_capacity_ah"],
                                        currentdata["ChargerSourcePriority_text"],
                                        currentdata["BatteryCurrent"],
                                        currentdata["BatteryVoltage"],
                                        currentdata["MaxChargerCurrent"]
                                        
                                    );

                                    this.msg=helper.fdate()+": "+JSON.stringify(modelresult);

                                    for(let j=this.modelresults.length-1;j>=0;j--){
                                        this.msg+='<p class="smalltext">'+helper.fdate(this.modelresults[j].time)+": "+JSON.stringify(this.modelresults[j].res)+"</p>";
                                    }

                                    this.modelresults.push({"res":modelresult,"time":helper.unixTimestamp()});

                                    //already has data: check change
                                    if (this.modelresults.length>1){
                                        let lastmr=this.modelresults[this.modelresults.length-2];
                                        
                                        if (lastmr.suggested_mode!=modelresult.res.suggested_mode || lastmr.suggested_charge!=modelresult.res.suggested_charge) {
                                            notifier.notifier(configobj,"SMX ALERT "+configobj.ipaddress,
                                            "Suggested output mode switch: "+lastmr.suggested_mode+" -> "+modelresult.suggested_mode+"\n Charger priority: "+lastmr.suggested_charge+" -> "+modelresult.res.suggested_charge);
                                        }
                                    }

                                    if (this.modelresults.length>100) {
                                        this.modelresults.shift();
                                    }
                                }
                                else{
                                    console.log("ENERGY_ERROR:","Missing min/switch/charge percents data values are bad!");
                                    this.msg="ENERGY_ERROR: Missing min/switch/charge percents or data values are wrong!";
                                    return false;
                                }

                        }else{
                            console.log("ENERGY_ERROR:","Missing min/switch/charge percents!");
                            this.msg="ENERGY_ERROR: Missing min/switch/charge percents!";
                            return false;
                        }
                    }else{
                        console.log("ENERGY_ERROR:","Warn: Current battery or inverter data not available.(Check selected plugin!)");
                        this.msg="ENERGY_WARNING: Current battery or inverter info not available.(Check selected plugin!)";
                        return false;
                    }    
                    
                }
                else{
                    console.log("ENERGY_ERROR:","Model not selected!");
                    this.msg="ENERGY_ERROR: Model not selected!";
                    return false;
                }

            }else{
                console.log("ENERGY_INFO:","No model chosen!");
                this.msg="ENERGY_INFO: No model chosen!";
                return false;
            }

        }
    }

}

module.exports=energymodels;