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
                "preserve_ah": { "type": "number", "title": "Preserve x AH in battery for grid outages" }
            }
        });

        return sch;
    }

    run(configobj,currentdata,history) {

        if (typeof configobj["forecast_url"] != undefined) {
            forecast.getforecast(configobj["forecast_url"]);
        }    

        if (typeof configobj["energymgmt"] != undefined) {
            if (configobj["energymgmt"]=="energymodel1") {
                //here begins the magic
            }
        }
    }

}

module.exports=energymodels;