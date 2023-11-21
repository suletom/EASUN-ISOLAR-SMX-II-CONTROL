const helper = require("./helper.js");
const forecast = require("./forecast.js");

//this class is only responsible for returning suggested OUT/Charge mode
class energyver1 {

    constructor(){
      
    }

    run(unixtime,current_solar_watts,prediction,ah_min_point,ah_switch_point,ah_charge_point,preserve_ah,current_ah,current_mode,ah_capacity,current_charge_mode,consumption_a,voltage,charge_max_a,full_consumption_w,history){
      //console.log("ENERGYv1: ",helper.fdate(unixtime));

      this.history=history;

      this.wasfullycharged=false;
      if (history!=undefined && history.length>0) {
        for(let cv=this.history.length-1;cv>0;cv--){

          //try to fully charge at every 5 days
          if ( this.history[cv]["timestamp"] > (helper.unixTimestamp()-(3600*24*5))  && this.history[cv]['battery_rv']==1 && this.history[cv]['battery_soc']==100){
            this.wasfullycharged=true;
          }
        }
      }  

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
      this.preserve_ah=preserve_ah;

      //store current date prediction to return
      this.predicted_data="";

      this.voltage=voltage;
      this.charge_max_a=charge_max_a;
      this.full_consumption_w=full_consumption_w;

      //calculate remaining time with current load
      //this.time_to_min_s=((current_ah-ah_min_point)/(consumption_a))*3600;
      //this.time_to_switch_s=((current_ah-ah_switch_point)/(consumption_a))*3600;

      let prevdatekey="";
      let cob=helper.fdateobj(this.unixtime);
      let current_date_str=cob.year+"-"+cob.mon+"-"+cob.day+" "+cob.hour+":"+cob.min+":"+cob.sec;
      for(let datekey in this.prediction.result.watts){

        //search for current hour prediction
        if (current_date_str<datekey && current_date_str>prevdatekey){

           this.predicted_data=this.prediction.result.watts[datekey];

        }

        prevdatekey=datekey;

      }

      if (current_solar_watts!==null) {
         this.predicted_data=current_solar_watts;
      }

      console.log({"Predicted solar watts (or realtime data if available)":this.predicted_data,"date":helper.timestamptodate(this.unixtime)});

      return this.get_suggested_mode();

    }
   
    /**
     * Determines if current_ah is enough for the next "dark" period
     * @returns boolean
     */
    charge_enough(calc_to_sw_point=0) {
      
      //console.log("current cons:",this.consumption_a*this.voltage);

      let cob=helper.fdateobj(this.unixtime);
      let current_date_str=cob.year+"-"+cob.mon+"-"+cob.day+" "+cob.hour+":"+cob.min+":"+cob.sec;


      //console.log("ENERGYv1: charge_enough: search prediction for this consumption(w):",this.consumption_a*this.voltage);

      let needed_time_to_solar="";
      let solar_input_wh=0;
      let lastdk=0;

      //console.log("ENERGYv1: pred:"+JSON.stringify(this.prediction.result.watts));

      for(let datekey in this.prediction.result.watts){

          let kdate=helper.unixTimestamp(new Date(datekey));

          if (current_date_str<datekey){
            
            //search for next enough solar input
            if (this.prediction.result.watts[datekey]>(this.full_consumption_w)){
                 needed_time_to_solar=datekey;
              break;
            }

            solar_input_wh+= (this.prediction.result.watts[datekey]*((kdate-lastdk)/3600))

          }  
        
          lastdk=kdate;
      }

      console.log("ENERGYv1: charge_enough: next predicted time when solar available: "+needed_time_to_solar);

      console.log("ENERGYv1: charge_enough: predicted solar input wh: "+solar_input_wh);

      if (needed_time_to_solar==""){
          console.log("ENERGYv1: charge_enough: predicted solar missing return false");
          //not found in prediction -> false
          return false;
      }else{
          //found next solar time
          let time=helper.unixTimestamp(new Date(needed_time_to_solar));
          let timediff=time-this.unixtime;
         
          //console.log("ENERGYv1: charge_enough: time diff for solar in sec: ",timediff);

          //calculate consumption for that time
          let consumption_wh=(timediff/3600)*(this.full_consumption_w);

          console.log("ENERGYv1: charge_enough: consumption_wh: ",consumption_wh);

          consumption_wh-=solar_input_wh;
          
          console.log("ENERGYv1: charge_enough: consumption_wh with solar input included: ",consumption_wh);

          let min_ah_to_store=((calc_to_sw_point==1)?this.ah_switch_point:this.ah_min_point);
          console.log("ENERGYv1: charge_enough: calc to:param: "+calc_to_sw_point+" ah_sw_point: "+this.ah_switch_point+" ah_min_point: "+this.ah_min_point);


          //200   4200/24 (168) 168+44
          if (this.current_ah > ((consumption_wh/this.voltage)+min_ah_to_store) ){
              console.log("ENERGYv1: charge_enough: true (current_ah: "+this.current_ah+" calculated_ah: "+((consumption_wh/this.voltage)+min_ah_to_store)+")  min_ah_to_store: "+min_ah_to_store);

              return true;
          }else{
              console.log("ENERGYv1: charge_enough: false (current_ah: "+this.current_ah+" calculated_ah: "+((consumption_wh/this.voltage)+min_ah_to_store)+") min_ah_to_store: "+min_ah_to_store);
              return false;
          } 
          
      }

    }

    get_suggested_mode(){
      
      let suggested_mode="";
      let suggested_charge="";

      //search current date and check whether solar watts will be enough for the current consumption
      //let pred_ok=this.prediction_ok();
      let pred_ok=this.charge_enough();

      suggested_charge=this.charge_switch_control();

      if (this.current_ah>this.ah_min_point){

        //console.log("ENERGYv1: AH > AH_MIN");
        if (this.current_mode=="UTI") {
          if (pred_ok){
            if (this.wasfullycharged) {
              console.log("ENERGYv1: (IN UTI) charge_seems_enough -> swtich to SBU "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
              suggested_mode="SBU";
            }else{
              console.log("ENERGYv1: (IN UTI) charge_seems_enough, but full charge was long ago -> stay in to UTI "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
              suggested_mode="UTI";
            }  
          }else{
            console.log("ENERGYv1: (IN UTI) charge_seems_NOT_enough -> stay in UTI"+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
            suggested_mode="UTI";  
          }
        }else{
          console.log("ENERGYv1: else current mode: "+this.current_mode+" -> switch to SBU "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
          suggested_mode="SBU";
        }  

        //if charged: switch before sunset if power won't be enough
        if (this.sunset_preseve_switch()){
          console.log("ENERGYv1: sunset preserve -> switch to UTI "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
          suggested_mode="UTI";
        }
                
      }else{ 

         //soc greater than switch point
         if(this.current_ah>this.ah_switch_point){
           //console.log("ENERGYv1: AH_SWITCH < AH < AH_MIN");

           if (this.current_mode=="SBU") {

              if (this.charge_enough(1)){
                suggested_mode="SBU";
                console.log("ENERGYv1: (IN SBU) above sw point -> SBU "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
              }else{

                if (this.consumption_a<=0){
                  suggested_mode="SBU";
                  console.log("ENERGYv1: (IN SBU) above sw point, charging -> STAY IN SBU "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
                }else{
                  suggested_mode="UTI"
                  console.log("ENERGYv1: (IN SBU) above sw point -> UTI "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
                }

                
              }

           }else{

              //if (this.charge_enough()){
              //    suggested_mode="SBU";
              //    console.log("ENERGYv1: min-sw point -> SBU "+helper.fdate(this.unixtime));
              //}else{
                  suggested_mode="UTI";
                  console.log("ENERGYv1: min-sw point STAY IN UTI "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
              //}
          }

         }else{  //soc lower than switch point 

            if (this.current_ah>this.ah_charge_point){ //above charge point

              console.log("ENERGYv1: AH_CHARGE < AH < AH_SWITCH -> UTI "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);
              suggested_mode="UTI";
              
            }else{ //lower than charge point

              suggested_mode="UTI";
              console.log("ENERGYv1: AH < AH_CHARGE -> UTI "+helper.fdate(this.unixtime)+" current ah:"+this.current_ah);

              suggested_charge="SNU";

            }
             
         }

      }

      return {"suggested_mode":suggested_mode,"suggested_charge":suggested_charge,"predicted_data":this.predicted_data};
    }

    charge_switch_control() {

      if (this.current_charge_mode=="SNU"){

        if (this.charge_enough() && this.current_ah>this.ah_min_point){
          //console.log("chargeen: true");
          return "OSO";
        }else{
          //console.log("chargeen: false");
        }
        
        return "SNU";
      }

      return "OSO";

    }
    
    //switch to uti before sunset at given percent
    //1. when to switch or check (time): around sunset!? (check at a given time window?) -> check if there won't be enough power
    //2. condition to switch: given soc percent but do not switch if energy will be enough!
    sunset_preseve_switch() {
      
      //console.log("ENERGYv1: sunset: preserve check: curr_ah: ",this.current_ah," preserv_ah: ",this.preserve_ah);
      
      //search for today sunset
      let sd=forecast.search_sunsets(this.prediction.result.watts,this.unixtime);
      //console.log("energy after ss:",sd);
      if (sd.next_sunset!=0){
        //found sunset
        //console.log("ENERGYv1: found sunset ");

        //check if in SBU
        if (this.current_mode=="SBU") {
          
          //check if battery below setpoint
          if (this.current_ah<this.preserve_ah) {
            //console.log("ENERGYv1: sunset: current_ah < preserve_ah");
            if (!this.charge_enough(1)) {
              //console.log("ENERGYv1: sunset: charge not enough -> suggest switch");
              //suggest switch
              return true;
            }
          }
        }
      }

      return false;
    }
    
}

module.exports=energyver1;