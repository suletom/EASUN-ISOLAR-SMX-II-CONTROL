const safeswitch = require("./safeswitch.js");
const helper = require("./helper.js");

class systememulator{

    constructor(config,energycontroller,data,history,prediction){
        this.energycontroller=energycontroller;
        this.prediction=prediction;
        this.config=config;
        this.data=data;
        this.history=history;
        this.safeswitchinst = new safeswitch();
    }

    calculate(time,stepping){

      //console.log("BUGSRC before:",this.data);
      let suggestion=this.energycontroller.run(this.config,this.data,this.history,time);
      if (this.data['OutputPriority_text'] != undefined && this.data['OutputPriority_text'] != "N/A" && this.data['ChargerSourcePriority_text']!=undefined && this.data['OutputPriority_text'] != "N/A" ){
          this.safeswitchinst.init(this.data['OutputPriority_text'],this.data['ChargerSourcePriority_text'],0);
      }
      
      if (suggestion!=false) {
        this.safeswitchinst.switch_mode(this.config,suggestion.suggested_mode,suggestion.suggested_charge,time);

      }

      let safeout=this.safeswitchinst.getmodes();

      let prediction=0;
      let prevdatekey=0;
      let cob=helper.fdateobj(time);
      let current_date_str=cob.year+"-"+cob.mon+"-"+cob.day+" "+cob.hour+":"+cob.min+":"+cob.sec;
      for(let datekey in this.prediction.result.watts){

        //search for current hour prediction
        if (current_date_str<datekey && current_date_str>prevdatekey){
          prediction=this.prediction.result.watts[datekey];
        }

        prevdatekey=datekey;

      }

      /*
      currentdata["battery_ah_left"],
      currentdata['OutputPriority_text'],
      currentdata["battery_capacity_ah"],
      currentdata['ChargerSourcePriority_text'],
      currentdata["BatteryCurrent"],
      currentdata["BatteryVoltage"],
      currentdata["MaxChargerCurrent"],
      currentdata["LoadActivePower"]
      */

      let new_current_ah=this.data["battery_ah_left"];

      
      let solar_amps_left=prediction/this.data["BatteryVoltage"];

      let self_consumption_a=(this.config["inverter_self_consumption"]!==undefined?this.config["inverter_self_consumption"]:0);

      let consuption_a=this.data["LoadApparentPower"]/this.data["BatteryVoltage"];

      if (this.data['OutputPriority_text']=="SBU"){
        
        //current simulated solar watts > consumption
        if (prediction > (consuption_a+self_consumption_a)*this.data["BatteryVoltage"] ){
          //no discharge
          solar_amps_left=(prediction/this.data["BatteryVoltage"])-(consuption_a+self_consumption_a);
        }else{

    
           //calculated consuption
          new_current_ah+=(-(stepping/3600)*consuption_a);
          new_current_ah+=(-(stepping/3600)*self_consumption_a);
        }

        //console.log("new_current_ah - cons:",new_current_ah);
      }else{
        if (this.data['OutputPriority_text']=="UTI"){
          //only self consuption
          new_current_ah+=(-(stepping/3600)*self_consumption_a);
          //console.log("new_current_ah - cons:",new_current_ah);
        }
      }

      

      let charge=0;

      //console.log("charge0:",charge);
      if (['ChargerSourcePriority_text']=="SNU"){
        charge=(stepping/3600)*this.data["MaxChargerCurrent"];
        //console.log("charges:",charge);
      }else{

        if (prediction>0) {

          //solar amps
          charge=solar_amps_left;

          //limit charger amps
          if (charge>this.data["MaxChargerCurrent"]){
            charge=this.data["MaxChargerCurrent"];
          }

          charge=charge*(stepping/3600);
        }  
      
      }
     
      //solar charge
      new_current_ah+=charge;

      this.data["battery_ah_left"]=parseFloat(Number.parseFloat(new_current_ah).toFixed(3));

      if (this.data["battery_ah_left"]>this.data["battery_capacity_ah"]){
        this.data["battery_ah_left"]=Math.round(this.data["battery_capacity_ah"]);
      }
     
      this.data["battery_soc"]=Math.round((this.data["battery_ah_left"]/this.data["battery_capacity_ah"])*100);

      this.data['OutputPriority_text']=safeout.stored_mode;
      this.data['ChargerSourcePriority_text']=safeout.stored_charge;

      //console.log("BUGSRC after:",this.data);
      return this.data;
    }

}

module.exports=systememulator;