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
                    
                },
                "allow_model_control": {
                    "type": "string",
                    "title": "Allow model control",
                    "enum": ["False","True"],
                }
                
            }
        });

        return sch;
    }

    param_ok(data,param){

        //check if exists
        if (data[param]!==undefined){

            if (data[param]!="N/A"){
                return true;
            }else{
                console.log("Model Param error: ",param," -> ",data[param]);
            }

        }else{
            console.log("Model Param error: ",param," -> undefined",data);
        }

        return false;
    }

    param_int_ok(data,param){
        if (this.param_ok(data,param)){
            if (Number.isInteger(data[param])){
                return true;
            }else{
                console.log("Model Param not integer: ",param," -> ",data[param]);
                return false;
            }
        }
        return false;
    }

    param_float_ok(data,param){
        if (this.param_ok(data,param)){
            if (!Number.isNaN(data[param])){
                
                if (Number(data[param]) === data[param] && ((data[param] % 1) !== 0 ) ) {
                    return true;
                }

                if (Number.isInteger(data[param])){
                    return true;
                }

                console.log("Model Param type is unknown: ",param," -> ",data[param]);

            }else{
                console.log("Model Param is NaN: ",param," -> ",data[param]);
                return false;
            }
        }
        return false;
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

            console.log("ENERGY_WARNING:","Prediction empty!");
            this.msg="ENERGY_WARNING: Prediction empty!";

            //create fake null prediction and notify
            let td=helper.fdateobj();
            let today=td.year+"-"+td.mon+"-"+td.day;

            let to={};
            to[today+" 08:00:00"]=0;
            to[today+" 12:00:00"]=0;
            to[today+" 16:00:00"]=0;
            prediction={"result":{"watts":to}};

        }

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

                                    //check current input data
                                    let perr=true;

                                    perr &=this.param_float_ok(currentdata,"battery_ah_left");
                                    perr &=this.param_ok(currentdata,"OutputPriority_text");
                                    perr &=this.param_int_ok(currentdata,"battery_capacity_ah");
                                    perr &=this.param_ok(currentdata,"ChargerSourcePriority_text");
                                    perr &=this.param_float_ok(currentdata,"BatteryCurrent");
                                    perr &=this.param_float_ok(currentdata,"BatteryVoltage");
                                    perr &=this.param_int_ok(currentdata,"MaxChargerCurrent");
                                    perr &=this.param_int_ok(currentdata,"LoadActivePower");


                                    //here begins the magic
                                    let energy=new energy_ver1();
                                    
                                    let modelresult=energy.run(nowtime,null,prediction,
                                        ah_min_point,
                                        ah_switch_point,
                                        ah_charge_point,
                                        ah_preserve_point,
                                        currentdata["battery_ah_left"],
                                        currentdata['OutputPriority_text'],
                                        currentdata["battery_capacity_ah"],
                                        currentdata['ChargerSourcePriority_text'],
                                        currentdata["BatteryCurrent"],
                                        currentdata["BatteryVoltage"],
                                        currentdata["MaxChargerCurrent"],
                                        currentdata["LoadActivePower"],
                                        history
                                    );

                                    if (modelresult==false || modelresult==null || perr==false){

                                        this.msg="<p>"+helper.fdate()+": ERROR: modelresult -> N/A</p>";
                                        return false;

                                    }else{

                                        //current suggestion by chosen model
                                        console.log("ENERGY: current suggestion by chosen model:"+modelresult.suggested_mode+"  "+modelresult.suggested_charge+"  ("+modelresult.predicted_data+")");

                                        this.msg="<p>"+helper.fdate()+": "+modelresult.suggested_mode+"  "+modelresult.suggested_charge+"  ("+modelresult.predicted_data+")</p>";

                                        let ci=0;
                                        for(let j=this.modelresults.length-1;j>=0;j--){

                                            this.msg+='<p class="smalltext">'+helper.fdate(this.modelresults[j].time)+": "+this.modelresults[j].res.suggested_mode+"  "+this.modelresults[j].res.suggested_charge+"  ("+this.modelresults[j].res.predicted_data+")</p>";
                                            ci++;
                                            if (ci>20) break;
                                        }


                                        //truncate internal log
                                        if (this.modelresults.length>100) {
                                            this.modelresults.shift();
                                        }


                                        if (this.modelresults.length==0 || 
                                            (this.modelresults.length>0 && 
                                                (
                                                    this.modelresults[this.modelresults.length-1].res.suggested_mode!=modelresult.suggested_mode ||
                                                    this.modelresults[this.modelresults.length-1].res.suggested_charge!=modelresult.suggested_charge  
                                                )
                                            )
                                           
                                        ) {

                                            this.modelresults.push({"res":modelresult,"time":helper.unixTimestamp()});
                                            //check change -> notifiy
                                            let lastmr={"suggested_mode":"INITIAL "+currentdata['OutputPriority_text'],"suggested_charge":"INITIAL "+currentdata['ChargerSourcePriority_text']};
                                            if (this.modelresults.length>1){
                                                lastmr=this.modelresults[this.modelresults.length-2].res;
                                            }

                                            return modelresult;

                                        }

                                        //force trigger suggestion if real states on inverter differs
                                        if (
                                             (this.modelresults.length>0 && 
                                                (
                                                    currentdata['OutputPriority_text']!=modelresult.suggested_mode ||
                                                    currentdata['ChargerSourcePriority_text']!=modelresult.suggested_charge  
                                                )
                                            )
                                           
                                        ) {
                                            return modelresult;
                                        }

                                        return false;
                                        
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

module.exports=energymodels;