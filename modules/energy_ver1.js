const helper = require("./helper.js");

//this class is only responsible for returning suggested OUT/Charge mode
class energyver1 {

    constructor(){
      
    }

    run(unixtime,prediction,ah_min_point,ah_switch_point,ah_charge_point,current_ah,current_mode,ah_capacity,current_charge_mode,consumption_a,voltage,charge_max_a){
      console.log("ENERGYv1: ",helper.fdate(unixtime));

      this.prediction=prediction;
      this.unixtime=unixtime;
      
      this.ah_min_point=ah_min_point;
      this.ah_switch_point=ah_switch_point;
      this.ah_charge_point=ah_charge_point;

      this.current_ah=current_ah;
      this.current_mode=current_mode;
      this.current_charge_mode=current_charge_mode;
      this.consumption_a=consumption_a;
      this.ah_capacity=ah_capacity;

      //store current date prediction to return
      this.predicted_data="";

      this.voltage=voltage;
      this.charge_max_a=charge_max_a;

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

           this.predicted_data=this.prediction.result.watts[datekey];
           
           if (this.prediction.result.watts[datekey]>(this.consumption_a*this.voltage)){
              console.log("ENERGYv1: prediction true: ",current_date_str," ",this.prediction.result.watts[datekey]," ",(this.consumption_a*this.voltage));
              return true;
           }
        }

        prevdatekey=datekey;
      }

      console.log("ENERGYv1: prediction false ");

      return false;

    }


    charge_enough() {
      
      console.log("current cons:",this.consumption_a*this.voltage);

      let cob=helper.fdateobj(this.unixtime);
      let current_date_str=cob.year+"-"+cob.mon+"-"+cob.day+" "+cob.hour+":"+cob.min+":"+cob.sec;


      console.log("ENERGYv1: search prediction for this consumption(w):",this.consumption_a*this.voltage);

      let needed_time_to_solar="";
      for(let datekey in this.prediction.result.watts){

          if (current_date_str<datekey){
            //search for next enough solar input
            
            if (this.prediction.result.watts[datekey]>(this.consumption_a*this.voltage)){
              needed_time_to_solar=datekey;
              break;
            }
          }  
        
      }

      console.log("ENERGYv1: next precited time when solar available: ",needed_time_to_solar);

      if (needed_time_to_solar==""){
          //not found in prediction -> false
          return false;
      }else{
          //found next solar time
          let time=helper.unixTimestamp(new Date(needed_time_to_solar));
          let timediff=time-this.unixtime;
         
          console.log("ENERGYv1: time diff for solar in sec: ",timediff);

          //calculate consumption for that time
          let consumption_wh=(timediff/3600)*(this.consumption_a*this.voltage);

          console.log("ENERGYv1: consumption_wh: ",consumption_wh);

          let timetocharge=consumption_wh/(this.charge_max_a*this.voltage);

          console.log("ENERGYv1: timetocharge: ",timetocharge);

          console.log("ENERGYv1: charge_enough: predicted needed ah:",(this.ah_min_point+(timetocharge*this.charge_max_a)));

          if (this.ah_min_point+(timetocharge*this.charge_max_a) < this.current_ah ){
             console.log("ENERGYv1: ch enough true ");

             return true;
          }else{
             console.log("ENERGYv1: ch enough false ");

             return false;
          }
          

      }

    }

    get_suggested_mode(){
      
      let suggested_mode="";
      let suggested_charge="";

      //search current date and check whether solar watts will be enough for the current cunsumption
      let pred_ok=this.prediction_ok();

      suggested_charge=this.charge_switch_control();

      if (this.current_ah>this.ah_min_point){

        console.log("ENERGYv1: AH > AH_MIN");
        if (this.current_mode=="UTI") {
          if (pred_ok){
            suggested_mode="SBU";
          }else{
            suggested_mode="UTI";  
          }
        }else{
          suggested_mode="SBU";
        }  
                
      }else{
         //eg. < 20%
         if(this.current_ah>this.ah_switch_point){

           console.log("ENERGYv1: AH_SWITCH < AH < AH_MIN");

           if (pred_ok){
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

      return {"suggested_mode":suggested_mode,"suggested_charge":suggested_charge,"predicted_data":this.predicted_data};
    }

    charge_switch_control() {

      if (this.current_charge_mode=="SNU"){

        if (this.charge_enough()){
          //console.log("chargeen: true");
          return "OSO";
        }else{
          //console.log("chargeen: false");
        }
        
        return "SNU";
      }

      return "OSO";

    }
    
}

module.exports=energyver1;