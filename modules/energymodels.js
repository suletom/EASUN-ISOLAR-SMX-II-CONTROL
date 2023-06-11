const energy_ver1 = require("./energy_ver1.js");
const forecast = require("./forecast.js");
const helper = require("./helper.js");

class energymodels{

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
                    
                }
                
            }
        });

        return sch;
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
            return false;
        }else{


            if (typeof configobj["energymgmt"] != undefined && typeof configobj["energymgmt"][0] != undefined && typeof configobj["energymgmt"][0]["model_chosen"] != undefined ) {

                if (configobj["energymgmt"][0]["model_chosen"]=="energymodel1") {

                    if (
                        configobj["energymgmt"][0]["min_point"] != undefined &&
                        configobj["energymgmt"][0]["switch_point"] != undefined &&
                        configobj["energymgmt"][0]["charge_point"] != undefined ){
                            if ( configobj["energymgmt"][0]["min_point"]<100 && configobj["energymgmt"][0]["min_point"]>0 &&
                                configobj["energymgmt"][0]["switch_point"]<100 && configobj["energymgmt"][0]["switch_point"]>0 &&
                                configobj["energymgmt"][0]["charge_point"]<100 && configobj["energymgmt"][0]["charge_point"]>0 &&
                                configobj["energymgmt"][0]["min_point"] > configobj["energymgmt"][0]["switch_point"] &&
                                configobj["energymgmt"][0]["switch_point"] > configobj["energymgmt"][0]["charge_point"]
                            ){

                                let ah_min_point=currentdata["battery_capacity_ah"]*((configobj["energymgmt"][0]["min_point"])/100);
                                let ah_switch_point=currentdata["battery_capacity_ah"]*((configobj["energymgmt"][0]["switch_point"])/100);
                                let ah_charge_point=currentdata["battery_capacity_ah"]*((configobj["energymgmt"][0]["charge_point"])/100);

                                //here begins the magic
                                let energy=new energy_ver1();
                                
                                return energy.run(nowtime,prediction,
                                    ah_min_point,
                                    ah_switch_point,  
                                    ah_charge_point,
                                    currentdata["battery_ah_left"],
                                    currentdata["OutputPriority_text"],
                                    currentdata["battery_capacity_ah"],
                                    currentdata["ChargerSourcePriority_text"],
                                    currentdata["BatteryCurrent"],
                                    currentdata["BatteryVoltage"],
                                    currentdata["MaxChargerCurrent"]
                                );

                            }
                            else{
                                console.log("ENERGY_ERROR:","Missing min/switch/charge percents data values are bad!");
                                return false;
                            }

                    }else{
                        console.log("ENERGY_ERROR:","Missing min/switch/charge percents!");
                        return false;
                    }
                    
                }
                else{
                    console.log("ENERGY_ERROR:","Model not selected!");
                    return false;
                }

            }else{
                console.log("ENERGY_INFO:","No model chosen!");
                return false;
            }

        }
    }

}

module.exports=energymodels;