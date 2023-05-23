const battery = require("./battery.js");
const jbdbattery = require("./jbdbattery.js");
const inverterbattery = require("./inverterbattery.js");


class batterymodels{

    static get_ui_schema=function(){

        let sch=[];
       
        sch.push({
            "title": "INVERTER SOC/data",
            "type": "object",
            "id": "inverter_battery",
            "properties": {
                "capacity_ah": {"type": "number", "title": "Battery capacity (Ah)"},
                "added_consumption_a": { "type": "number", "title": "Added (self) consuption (A)" }
            }         
        });

        sch.push({
            "title": "Software calculaton based on charger registers",
            "type": "object",
            "id": "sotware_battery",
            "properties": {
                "capacity_ah": {"type": "number", "title": "Battery capacity (Ah)"},
                "added_consumption_a": { "type": "number", "title": "Added (self) consuption (A)" }
            }
        });

        sch.push({
            "title": "Read from file",
            "type": "object",
            "id": "external_battery"
        });

        return sch;
    }

    construct(){
        this.history=[];
        this.currentdata=[];
    }

    run(configobj,currentdata,history){

        this.history=history;
        this.currentdata=currentdata;

        let battype="inverter_battery";

        if (typeof configobj["battery"] != undefined) {

            switch (configobj["battery"]){
                case 'sotware_battery': 
                    battype='sotware_battery';
                break;
                case 'external_battery': 
                    battype='external_battery';
                break;
                default:
                break;
            }
        }

        return this[battype]();

    }

    software_battery(){

        let batinf=battery.calcsoc(add.capacity_ah,add.added_consumption_a,this.history);
        return batinf;

    }

    external_battery(){

        let batinf=jbdbattery.calcsoc();
        return batinf;
    }

    inverter_battery(){
        let batinf=inverterbattery.calcsoc(this.currentdata);
        return batinf;
    }

}

module.exports=batterymodels;