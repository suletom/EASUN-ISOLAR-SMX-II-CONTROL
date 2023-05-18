const battery = require("./battery.js");
const jbdbattery = require("./jbdbattery.js");


class batterymodels{

    static get_ui_schema=function(){

        let sch=[];
       
        sch.push({
            "title": "INVERTER SOC/data",
            "type": "object",
            "id": "inverter_battery",            
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

    info_to_string(batinf){
        let info="";
        if (batinf.rv==1){
            info+=batinf.soc+"% "+batinf.state+((batinf.remaining!=0)?(" Remaining hours: "+batinf.remaining):"")+" "+(batinf.ah_left+" Ah left");
        }else{
            info+=batinf.errors.join("; ");
        }

        /*
        let info="";
        if (batinf.rv==1){
            info+="BMS info: "+batinf.soc+"% "+batinf.state+((batinf.remaining!=0)?(" Remaining hours: "+batinf.remaining):"")+" "+(batinf.ah_left+" Ah left");
            info+=" Current:"+batinf.amps;
        }else{
            info+=batinf.errors.join("; ");
        }
        */
       return info;

    }
    
    sotware_battery(add=null){

        let batinf=battery.calcsoc(add.capacity_ah,add.added_consumption_a,this.history);
        return batinf;

    }

    external_battery(add=null){

        let batinf=jbdbattery.calcsoc();
        return batinf;
    }

}

module.exports=batterymodels;