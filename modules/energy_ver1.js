const helper = require("./helper.js");

//this class is only responsible for managing the energy model (with stored states)
class energyver1 {

    constructor(ah_min,ah_switch,ah_charge){
      this.ah_min=ah_min;
      this.ah_switch=ah_switch;
      this.ah_charge=ah_charge;
    }


    run(current_ah,current_mode,current_charge,ah_left,consumption_a){
      
    }

    //check whether switching can be avoided?
    prediction_ok(){

    }

    get_suggested_mode(current_ah,current_mode,current_charge){
      
      let suggested_mode="";

      if (current_ah>this.ah_min){

         console.log("ENERGYv1: AH > AH_MIN");
         suggested_mode="SBU";

      }else{

         if(current_ah>this.ah_switch){

           console.log("ENERGYv1: AH_SWITCH < AH < AH_MIN");

           if (this.prediction_ok()){
              suggested_mode="SBU";
           }else{
              suggested_mode="UTI";
           }

         }else{

            if (current_ah>this.ah_charge){

              console.log("ENERGYv1: AH_CHARGE < AH < AH_SWITCH");
              suggested_mode="UTI";

            }else{

              console.log("ENERGYv1: AH < AH_CHARGE");
              suggested_mode="UTI";

            }
             
         }
      }

      return suggested_mode;
    }
    
}

module.exports=energyver1;