const energy_ver1 = require("./energy_ver1.js");

class energymodels{

    static get_ui_schema=function(){

        let sch=[];
       
        sch.push({
            "title": "Maximum SOLAR with maintained backup using forecast.solar prediction",
            "type": "object",
            "id": "energymodel1",
            }
        );

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