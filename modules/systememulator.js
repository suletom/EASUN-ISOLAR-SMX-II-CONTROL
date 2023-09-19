const safeswitch = require("./safeswitch.js");

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

      let suggestion=this.energycontroller.run(this.config,this.data,this.history,time);
      if (this.data['OutputPriority_text'] != undefined && this.data['OutputPriority_text'] != "N/A" && this.data['ChargerSourcePriority_text']!=undefined && this.data['OutputPriority_text'] != "N/A" ){
          this.safeswitchinst.init(this.data['OutputPriority_text'],this.data['ChargerSourcePriority_text']);
      }
      
      if (suggestion!=false) {
        this.safeswitchinst.switch_mode(this.config,suggestion.suggested_mode,suggestion.suggested_charge);
      }

      let safeout=this.safeswitchinst.getmodes();
      this.data['OutputPriority_text']=safeout.stored_mode;
      this.data['ChargerSourcePriority_text']=safeout.stored_charge;
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
      //console.log("new_current_ah:",new_current_ah);

      let solar_amps_left=this.data['OutputPriority_text']/this.data["BatteryVoltage"];

      let self_consumption_a=(this.config["inverter_self_consumption"]!==undefined?this.config["inverter_self_consumption"]:0);

      if (this.data['OutputPriority_text']=="SBU"){
        
        //current simulated solar watts > consumption
        if (suggestion.predicted_data > (this.data["BatteryCurrent"]+self_consumption_a)*this.data["BatteryVoltage"] ){
          //no discharge
          solar_amps_left=(suggestion.predicted_data/this.data["BatteryVoltage"])-(this.data["BatteryCurrent"]+self_consumption_a);
        }else{
          //calculated consuption
          new_current_ah+=(-(stepping/3600)*this.data["BatteryCurrent"]);
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

        if (suggestion.predicted_data>0) {

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

      this.data["battery_ah_left"]=new_current_ah;

      if (this.data["battery_ah_left"]>this.data["battery_capacity_ah"]){
        this.data["battery_ah_left"]=this.data["battery_capacity_ah"];
      }
      if (this.data["battery_ah_left"]){
        this.data["battery_ah_left"]=0;
      }

      this.data["battery_soc"]=Math.round((this.data["battery_ah_left"]/this.data["battery_capacity_ah"])*100);

      return this.data;
    }

}

module.exports=systememulator;