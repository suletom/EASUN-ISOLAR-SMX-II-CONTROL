const battery = require("./battery.js");
const jbdbattery = require("./jbdbattery.js");
const inverterbattery = require("./inverterbattery.js");
const helper = require("./helper.js");

class batterymodels{

    static get_ui_schema=function(){

        let sch=[];
       
        sch.push({
            //"capacity_ah": {"type": "number", "title": "Battery capacity (Ah)"}

            "title": "INVERTER SOC/data",
            "type": "object",
            "id": "inverter_battery",
            "properties": {
                "battery_chosen": {
                    "type": "string",
                    "title": "Type",
                    "enum": ["inverter_battery"]
                }    
            }
        });


        sch.push({
            "title": "Software calculaton based on charger registers",
            "type": "object",
            "id": "sotware_battery",
            "properties": {
                "battery_chosen": {
                    "type": "string",
                    "title": "Type",
                    "enum": ["software_battery"]
                }
            }
            
        });

        sch.push({
            "title": "Read from file",
            "type": "object",
            "id": "external_battery",
            "properties": {
                "battery_chosen": {
                    "type": "string",
                    "title": "Type",
                    "enum": ["external_battery"]
                }    
            }
        });

        return sch;
    }

    process_batinf(batinf){
        if (batinf.rv==0){
            return batinf;
        }else{

            //summaryinfo
            let summaryinfo="";

            let state=(batinf.current_consumption_a>0?"charging":"discharging");
            
            let ah_left=Math.round(batinf.capacity_ah*(batinf.soc/100));
            
            let remain=0;


            //if positive -> charging !!!!
            if (batinf.current_consumption_a>0){
                remain=(batinf.capacity_ah-ah_left)/Math.abs(batinf.current_consumption_a);
            }else{
                if (batinf.current_consumption_a==0){
                    remain=ah_left/0.0001;
                }else{
                    remain=ah_left/Math.abs(batinf.current_consumption_a);
                }    
            }
            
            let remain_text=Math.floor(remain)+" h "+Number(60*(remain%1)).toFixed(0)+" m";

            summaryinfo+="<span class=\"batterysoc\">"+batinf.soc+"% </span> ";
            
            summaryinfo+="<span class=\"batterycapacity\">"+ah_left+" / "+batinf.capacity_ah+" Ah left </span> ";
            summaryinfo+="<span class=\"batterystate\">"+state+" </span> ";
            summaryinfo+="<span class=\"batteryamps\">"+Number(batinf.current_consumption_a).toFixed(2)+"A </span> ";
            summaryinfo+="<span class=\"batteryremain\">"+remain_text+" </span> ";
            summaryinfo+="<div class=\"batteryetc\">"+batinf.info+" </div> ";
            
            let add={
            "remain": remain, 
            "ah_left": ah_left            
            };

            batinf.info=summaryinfo;

            return {...batinf,...add};

        }
    }

    checkp(p){
        if (p!==undefined && p!==null && p!=="N/A"){
            if (Number(p) === p){
                return true;
            }
        }
        return false;
    }

    get_chosen(){

        let r={};

        if (this.batterychosen==undefined || this.batterychosen=="") {
            r["battery_rv"]=0;
        }else{

            if (this.batterydata[this.batterychosen] != undefined){
                let cdata=this.batterydata[this.batterychosen];
                r["battery_rv"]=cdata.rv;
                if (cdata.rv==1) {

                    r["battery_soc"]=cdata.soc;
                    r["battery_ah_left"]=cdata.ah_left;
                    r["battery_capacity_ah"]=cdata.capacity_ah;
                    r["battery_seen"]=helper.unixTimestamp();
                    
                }
            }
        }
        console.log("ez:",r);
        
        return r;
    }

    get_current(){

        let out="";

        for(const prop in this.batterydata){
            out+=`<div><label>${prop}:</label><div>${this.batterydata[prop]["info"]}</div></div>`;
        }

        return out;
    }    

    construct(){
        this.history=[];
        this.currentdata=[];
        this.batterydata={};
        this.batterychosen="";
    }

    run(configobj,currentdata,history){

        this.history=history;
        this.currentdata=currentdata;

        let battype="inverter_battery";

        if (typeof configobj["battery"] != undefined && typeof configobj["battery"][0] != "undefined" && typeof configobj["battery"][0]["battery_chosen"] != "undefined" ) {

            switch (configobj["battery"][0]["battery_chosen"]) {
                case 'software_battery': 
                    battype='software_battery';
                break;
                case 'external_battery': 
                    battype='external_battery';
                break;
                default:
                break;
            }
        }

        this.batterychosen=battype;

        //return this[battype](configobj);
        let obj={};
        //run all for testing proposes
        obj["external_battery"]=this.external_battery(configobj);
        obj["software_battery"]=this.software_battery(configobj);
        obj["inverter_battery"]=this.inverter_battery(configobj);

        this.batterydata=obj;
    }
    

    software_battery(config){
    
        let info="";
            
        if (!this.checkp(config['battery_capacity'])) {
            info+="No battery capacity provided in config!";
        }else{
            if (config['battery_capacity']<=0){
                info+="No valid battery capacity provided in config!";
            }
        }

        if (!this.checkp(config['inverter_self_consumption'])) {
            info+="No inverter self conumption provided in config!";
        }

        if (info!=""){

            return this.process_batinf({"rv": 0, "info": info});

        }else{

            return this.process_batinf(battery.calcsoc(config['battery_capacity'],config['inverter_self_consumption'],this.history));
        }

    }

    external_battery(config){

        return this.process_batinf(jbdbattery.calcsoc());

    }

    inverter_battery(config){

        let info="";
            
        if (!this.checkp(config['battery_capacity'])) {
            info+="No battery capacity provided in config!";
        }else{
            if (config['battery_capacity']<=0){
                info+="No valid battery capacity provided in config!";
            }
        }

        if (!this.checkp(config['inverter_self_consumption'])) {
            info+="No inverter self conumption provided in config!";
        }

        if (info!=""){

            return this.process_batinf({"rv": 0, "info": info});

        }else{

            return this.process_batinf(inverterbattery.calcsoc(config['battery_capacity'],config['inverter_self_consumption'],this.currentdata));
        }    

    }

}

module.exports=batterymodels;
