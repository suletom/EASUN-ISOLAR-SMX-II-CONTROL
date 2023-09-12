class semulator{

    construct(config,energycontroller,data,prediction){
        this.energycontroller=energycontroller;
        this.prediction=prediction;
        this.config=config;
        this.data=data;
    }

    calculate(time){

        let newmode=this.energycontroller.run(this.config,currentdata,history,time);
        if (newmode!==false) {
            this.data.current_mode=newmode.s
            this.data.current_charge=
        }
    }

    static _getdemochart=function(data,config){

        let energy=new energyv1();

        let graphdata=[];
        let graphbattsoc=[];
        let graphconsumption=[];

        //run model from first to last date
        let mode=data.current_mode;
        let chargemode=data.current_charge;
        let annot=[];
        let init=0;
        

        let stepping=120; //sec


        for(let t=first_date;t<last_date;t=t+stepping){
            console.log("CM: "+data.current_mode);
            let newmode=energy.run(t,null,prediction,data.ah_min_point,data.ah_switch_point,data.ah_charge_point,data.preserve_ah,data.current_ah,data.current_mode,data.ah_capacity,data.current_charge,data.consumption_a,data.voltage,data.charge_max_a,data.consumption_a*data.voltage);

            if (start_time<t && start_time>t-stepping){

              let now=charts.annot(start_time,'#000',"NOW",'#fff',{"offsetY": 80})

              annot.push(now);
            }  
            
            if (t>show_time) {

              if (init==0){ //init state -> show modes
                init++;
                let ob=charts.annot(t,charts.modcols[data.current_mode],data.current_mode,
                  '#000',{"offsetX": -20});
                annot.push(ob);
                let ob1=charts.annot(t,charts.modcols[data.current_charge],data.current_charge,
                  '#000',{"offsetY": -38,"offsetX": -20}
                  );
                annot.push(ob1);
              
              }

              if (mode!=newmode.suggested_mode && newmode.suggested_mode!==undefined){

                let ob=charts.annot(t,charts.modcols[newmode.suggested_mode],newmode.suggested_mode,
                  '#000');
                
                annot.push(ob);
                
              }
              if (chargemode!=newmode.suggested_charge && newmode.suggested_charge!==undefined){

                let ob1=charts.annot(t,charts.modcols[newmode.suggested_charge],newmode.suggested_charge,
                  '#000',{"offsetY": -38}
                  );
                
                annot.push(ob1);
              }
              
              
              console.log("CMS2: "+newmode.suggested_mode);
              mode=newmode.suggested_mode;
              chargemode=newmode.suggested_charge;
            }  

            
            graphdata.push([t*1000,newmode.predicted_data]);
            graphbattsoc.push([t*1000, Math.round((data.current_ah/data.ah_capacity)*100) ]);

            graphconsumption.push([t*1000, 
              (mode=="SBU"?((data.consumption_a+data.self_consumption_a)*data.voltage):(data.self_consumption_a*data.voltage))]);
            
            if (t>show_time) {
              //simulate dischare/charge for next cycle..
              let new_current_ah=data.current_ah;
              console.log("new_current_ah:",new_current_ah);

              let solar_amps_left=newmode.predicted_data/data.voltage;

              if (mode=="SBU"){
                
                //current simulated solar watts > consumption
                if (newmode.predicted_data > (data.consumption_a+data.self_consumption_a)*data.voltage ){
                  //no discharge
                  solar_amps_left=(newmode.predicted_data/data.voltage)-(data.consumption_a+data.self_consumption_a);
                }else{
                  //calculated consuption
                  new_current_ah+=(-(stepping/3600)*data.consumption_a);
                  new_current_ah+=(-(stepping/3600)*data.self_consumption_a);
                }

                console.log("new_current_ah - cons:",new_current_ah);
              }else{
                if (mode=="UTI"){
                  //only self consuption
                  new_current_ah+=(-(stepping/3600)*data.self_consumption_a);
                  console.log("new_current_ah - cons:",new_current_ah);
                }
              }
              
              let charge=0;

              console.log("charge0:",charge);
              if (chargemode=="SNU"){
                charge=(stepping/3600)*data.charge_max_a;
                console.log("charges:",charge);
              }else{

                if (newmode.predicted_data>0) {

                  //solar amps
                  charge=solar_amps_left;

                  //limit charger amps
                  if (charge>data.charge_max_a){
                    charge=data.charge_max_a;
                  }

                  charge=charge*(stepping/3600);
                }  
                console.log("charge:",charge);
                console.log("predicted_data:",newmode.predicted_data);
                
              }

              console.log("new_current_ah before charge:",new_current_ah);


              console.log("charge:",charge);

              //solar charge
              new_current_ah+=charge;

              console.log("new_current_ah final:",new_current_ah);

              data.current_ah=new_current_ah;

              if (data.current_ah>data.ah_capacity){
                data.current_ah=data.ah_capacity;
              }
              if (data.current_ah<0){
                data.current_ah=0;
              }

              console.log("CMS1: "+mode);
              data.current_mode=mode;
              data.current_charge=chargemode;
            }  
        }

        /*
        let tss=forecast.search_sunsets(prediction.result.watts,start_time);

        tss.sunsets.forEach(function(el){
  
          let sunsettmp={
            "x": el*1000,
            "borderColor": "#000",
            "label": {
              "borderColor": "#fac657",
              "style": {
                "color": "#fff",
                "background": "#fac657",
                "fontSize": "8px"
              },
              "text": "S",
              "position": 'bottom',
              "offsetY": 15,
              "offsetX": 10,
            }
          };
  
          
          annot.push(sunsettmp);
        });
        */
        
             
        return charts._graph("demo",graphdata,graphbattsoc,graphconsumption,annot);
    }

}