const energy_ver1 = require("./energy_ver1.js");
const forecast = require("./forecast.js");

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

    run(configobj,currentdata,history) {

        if (typeof configobj["forecast_url"] != undefined) {
            forecast.getforecast(configobj["forecast_url"]);
        }    

        if (typeof configobj["energymgmt"] != undefined && typeof configobj["energymgmt"][0] != undefined && typeof configobj["energymgmt"][0]["model_chosen"] != undefined ) {

            if (configobj["energymgmt"][0]["model_chosen"]=="energymodel1") {
                //here begins the magic
            }

        }
    }

}

module.exports=energymodels;