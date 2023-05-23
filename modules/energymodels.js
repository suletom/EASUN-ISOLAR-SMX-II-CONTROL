const energy_ver1 = require("./energy_ver1.js");

class energymodels{

    static get_ui_schema=function(){

        let sch=[];
       
        sch.push({
            "title": "Maximum SOLAR with maintained backup using forecast.solar prediction",
            "type": "object",
            "id": "energymodel1",
            "properties": {
                "forecast_url": { "type": "string", "title": "forecast.solar API link to estimate (https://api.forecast.solar/estimate/47.686482/17.604971/20/100/4)" },
                "preserve_ah": { "type": "number", "title": "Preserve x AH in battery" }
            }
        });

        return sch;
    }

    run(configobj,currentdata,history){
        if (typeof configobj["energymgmt"] != undefined) {
            if (configobj["energymgmt"]=="energymodel1"){
                //energy_ver1.run
            }
        }
    }

}

module.exports=energymodels;