const helper = require("./helper.js");

//this class is only responsible for returning suggested OUT/Charge mode
class energyver1 {

    constructor(){
      
    }

    run(unixtime,prediction,ah_min_point,ah_switch_point,ah_charge_point,current_ah,current_mode,current_charge,consumption_a,voltage){
      
      this.prediction=prediction;
      this.unixtime=unixtime;
      
      this.ah_min_point=ah_min_point;
      this.ah_switch_point=ah_switch_point;
      this.ah_charge_point=ah_charge_point;

      this.current_ah=current_ah;
      this.current_mode=current_mode;
      this.current_charge=current_charge;
      this.consumption_a=consumption_a;

      this.voltage=voltage;

      //calculate remaining time with current load
      this.time_to_min_s=((current_ah-ah_min_point)/(consumption_a))*3600;
      this.time_to_switch_s=((current_ah-ah_switch_point)/(consumption_a))*3600;

      return this.get_suggested_mode();

    }

    //check whether switching can be avoided before switch point
    prediction_ok() {
      
      let cob=helper.fdateobj(this.unixtime);
      let current_date_str=cob.year+"-"+cob.mon+"-"+cob.day+" "+cob.hour+":"+cob.min+":"+cob.sec;

      let prevdatekey="";
      for(let datekey in this.prediction.result.watts){

        //search for current hour prediction
        if (current_date_str<datekey && current_date_str>prevdatekey){
           if (this.prediction.result.watts[datekey]>(this.consumption_a*this.voltage)){
              return true;
           }
        }

        prevdatekey=datekey;
      }

      return false;

    }

    get_suggested_mode(){
      
      let suggested_mode="";
      let suggested_charge="OSO";

      if (this.current_ah>this.ah_min_point){

         console.log("ENERGYv1: AH > AH_MIN");
         suggested_mode="SBU";

      }else{

         if(this.current_ah>this.ah_switch_point){

           console.log("ENERGYv1: AH_SWITCH < AH < AH_MIN");

           if (this.prediction_ok()){
              suggested_mode="SBU";
           }else{
              suggested_mode="UTI";
           }

         }else{

            if (this.current_ah>this.ah_charge_point){

              console.log("ENERGYv1: AH_CHARGE < AH < AH_SWITCH");
              suggested_mode="UTI";

            }else{

              console.log("ENERGYv1: AH < AH_CHARGE");
              suggested_mode="UTI";
              suggested_charge="SNU";

            }
             
         }

      }

      return {"suggested_mode":suggested_mode,"suggested_charge":suggested_charge};
    }
    
}

module.exports=energyver1;