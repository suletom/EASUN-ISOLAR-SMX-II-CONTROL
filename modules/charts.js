const energymodels = require("./energymodels.js");
const energyv1 = require("./energy_ver1.js"); 
const forecast = require("./forecast.js");
const helper = require("./helper.js");
const systememulator = require("./systememulator.js");

class charts{

    static modcols={"SBU":"#20b024","UTI":"#775DD0","OSO":"#ced10a","SNU":"#e62929"};

    static getasynclog=function(history,srcdate){

      let events=[];

      for(let cv=history.length-1;cv>0;cv--){
        if (history[cv]["asyncdata"]!=undefined ){
           for(let i=history[cv]["asyncdata"].length-1;i>0;i--){
              let eventtime=history[cv]["asyncdata"][i].date;
              if (srcdate>eventtime) {
                 //search in 5 min time window
                 if (srcdate-(5*60)<eventtime){
                    events.push(history[cv]["asyncdata"][i]);
                 }
              }
           }
        }
      }

      return events;

    }

    static getchartinfo=function(){
    
        //model test chart
        //{"unixtime,prediction,ah_min_point,ah_switch_point,ah_charge_point,current_ah,current_mode,current_charge,consumption_a,voltage"}

        let html=`<div>
                    <label>Energy model v1 test simulation</label>
                    <button class="btn btn-secondary" onclick="this.nextElementSibling.classList.toggle('hide');">Toggle chartparams!</button>
                    <textarea style="min-height: 300px" class="form-control hide">
                    {
                    "type":"energymodeltest1",
                    "start_time": "now",
                    "ah_min_point": 44,
                    "ah_switch_point": 22,
                    "ah_charge_point": 10,
                    "preserve_ah": 200,
                    "current_ah": 220,
                    "current_mode":"SBU",
                    "current_charge":"OSO",
                    "consumption_a":19,
                    "voltage": 26,
                    "ah_capacity":220,
                    "self_consumption_a":1.1,
                    "charge_max_a":65
                    }
                    </textarea>
                    <button class="btn btn-primary" onclick="getchart('energymodeltest1');">Run simulation!</button>
                   </div>`;

        let html2=`<div>
                   <label>MAIN CHART</label>
                   <button class="btn btn-secondary" onclick="this.nextElementSibling.classList.toggle('hide');">Toggle chartparams!</button>
                   <textarea style="min-height: 300px" class="form-control hide">
                    {"type": "maingraph", "interval":"days"}
                    </textarea>
                   
                   <button class="btn btn-primary" onclick="getchart('maingraph');">Show days!</button>
                   
                  </div>`;           

        return [
            {'id':'maingraph','html':html2},
            /*{'id':'energymodeltest1','html':html}*/
            
        ];
    }
    

    /*
    static _getdemochart=function(data,config){

        let start_time="";
        if (data.start_time=="now"){
           start_time=helper.unixTimestamp()
        }else{
           start_time=data.start_time;
        }
        
        let prediction=forecast.getforecast(config["forecast_url"]);

        if (prediction===null){
          return "<div>No cached prediction, fetching.....please try again later!</div>";
        }



        let first_date="";
        let last_date="";
        for(let key in prediction.result.watts) {

            if (first_date=="") first_date=helper.unixTimestamp(new Date(key));
            last_date=helper.unixTimestamp(new Date(key));

        }

        let show_time=first_date;
        if (!isNaN(parseInt(start_time))){
           show_time=parseInt(start_time);
        }

        let energymodel = new energymodels();
        let systememu=new systememulator(config,energymodel,data,history,prediction);

        //let energy=new energyv1();

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
        
             
        return charts._graph("demo",graphdata,graphbattsoc,graphconsumption,annot);
    }
    */

    //history[cv]["timestamp"]
    static annot=function(timestamp,color,text,textcolor="",obj=null){

      
      if (obj==null){
        obj={};
      }

      if (textcolor==""){
        textcolor="#fff";
      }

      let ob={
        "x": timestamp*1000,
        "borderColor": color,
        "label": {...{
          "borderColor": color,
          "style": {
            "color": "#fff",
            "background": color,
          },
          "text": text
        },...obj}
      };

      return ob;
    }



    static _getchart=function(inpdata,config,currentdata,history){

      let start_time="";
      for(let cv=0;cv<history.length;cv++){
        if (start_time===""){
          start_time=history[cv]["timestamp"];
        }
      }

      let sampletime=600;

      if (typeof inpdata["interval"] != undefined && inpdata["interval"]=="days"){
         start_time=helper.unixTimestamp()-24*3600*3;
         sampletime=300;
      }

      if (typeof inpdata["interval"] != undefined && inpdata["interval"]=="day"){
        start_time=helper.unixTimestamp()-24*3600*1;
        sampletime=60;
     }

      let prediction=forecast.getforecast(config["forecast_url"]);

      let annot=[];
      let outputmode="";
      let chargemode="";
      let graphdata=[];
      let graphbattsoc=[];
      let graphconsumption=[];

      let lastts=0;
      for(let cv=0;cv<history.length;cv++){

        if (history[cv]["timestamp"] < start_time) continue;

        /*
        let reasons=[]; 
        if (history[cv]['OutputPriority_text']!=outputmode || chargemode!=history[cv]['ChargerSourcePriority_text']){
          
          for (let j=cv;j>0;j--){
            if (history[j]["asyncdata"]!=undefined){
              for (let a=0;a<history[j]["asyncdata"].length;a++){
                if (history[j]["asyncdata"]["date"]+300 > history[cv]["timestamp"]){
                  reasons.push(history[j]["asyncdata"]);
                }

                //just check last 50 history item
                if (a>50) break;
              }
            }
          }
        }
        */

       let reason=""; 
        if (history[cv]['OutputPriority_text']!=outputmode || chargemode!=history[cv]['ChargerSourcePriority_text']){
          let reasons=charts.getasynclog(history,history[cv]["timestamp"]);
          if (reasons.length>0){
            for(let cj=0;cj<reasons.length;cj++){
              reason+="<div><strong>"+helper.fdate(reasons[cj]["date"])+":</strong><br/>";
              reason+=reasons[cj]["reason"].join("\n<br/>");
              reason+="\n<br/><br/></div>";
            }
            
          }
        }

        if (history[cv]['OutputPriority_text']!=outputmode) {

          annot.push(
            charts.annot(history[cv]["timestamp"],charts.modcols[history[cv]['OutputPriority_text']],history[cv]['OutputPriority_text'],'#000',
            { "clickcontent": reason})
          );
        }  

        if (chargemode!=history[cv]['ChargerSourcePriority_text']){

          let ta=charts.annot(history[cv]["timestamp"],charts.modcols[history[cv]['ChargerSourcePriority_text']],history[cv]['ChargerSourcePriority_text'],
          '#000',{"offsetY": -38,"clickcontent": reason}
          );

          annot.push(
            ta  
          );
          
        }

        chargemode=history[cv]['ChargerSourcePriority_text'];
        outputmode=history[cv]['OutputPriority_text'];

        if (lastts+sampletime<history[cv]["timestamp"]) {
          graphdata.push([history[cv]["timestamp"]*1000,history[cv]["PVPower"]]);
          graphbattsoc.push([history[cv]["timestamp"]*1000,history[cv]["battery_soc"]]);
          graphconsumption.push([history[cv]["timestamp"]*1000,history[cv]["LoadActivePower"]]);
          lastts=history[cv]["timestamp"];
        }
        
      }

      annot.push(
        charts.annot(helper.unixTimestamp(),'#000',"NOW",'#fff',{"offsetY": 40})
      );
     
      console.log(prediction);

      if (prediction!=null && (currentdata['battery_rv']!==undefined && currentdata['battery_rv']===1)){

        let tss=forecast.search_sunsets(prediction.result.watts);

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

        let energycontroller = new energymodels();
        let owndata = JSON.parse(JSON.stringify(currentdata));

        let emulator = new systememulator(config,energycontroller,JSON.parse(JSON.stringify(currentdata)),history,prediction);
        
        let stepping=300;

        for(let key in prediction.result.watts) {
          lastts=helper.unixTimestamp(new Date(key));
        }

        

        for (let ptime=helper.unixTimestamp();ptime<=lastts;ptime=ptime+stepping){
        
              let curp=0;
              for(let key in prediction.result.watts) {
                let pd=helper.unixTimestamp(new Date(key));
                if (pd>=ptime){
                  curp=prediction.result.watts[key];
                  break;
                }
              }


              let newdata=emulator.calculate(ptime,stepping);
              //console.log("ndd:",newdata);
              graphbattsoc.push([ptime*1000,newdata["battery_soc"]]);
              graphconsumption.push([ptime*1000,owndata["LoadActivePower"]]);

              if (newdata["OutputPriority_text"]!=owndata["OutputPriority_text"]){
                console.log("annot push:"+newdata["OutputPriority_text"]);
                annot.push(
                  charts.annot(ptime,charts.modcols[newdata["OutputPriority_text"]],newdata["OutputPriority_text"],'#444')
                );
              }

              if (newdata["ChargerSourcePriority_text"]!=owndata["ChargerSourcePriority_text"]){

                annot.push(
                  charts.annot(ptime,charts.modcols[newdata["ChargerSourcePriority_text"]],newdata["ChargerSourcePriority_text"],'#444')
                );
              }

              
              graphdata.push([ptime*1000,curp]);
              owndata=JSON.parse(JSON.stringify(newdata));   
        }
        
      }

      let annotstr=JSON.stringify(annot);
      
      return charts._graph("chartn",graphdata,graphbattsoc,graphconsumption,annotstr);
    };

    static _graph=function(id,graphdata,graphbattsoc,graphconsumption,annot="[]"){

          let out=`
          <div id="chart_${id}"></div>

          <script>


          function eachRecursive(obj)
            {
                for (var k in obj)
                {
                    if (typeof obj[k] == "object" && obj[k] !== null) {
                        eachRecursive(obj[k]);
                    } else {
                      if (k=="clickcontent" && obj[k]!=""){
                        
                        obj["click"]=Function("function(){ alert(\""+obj[k]+"\") }");
                      }
                    }
                        
                }
            }


          (function(){

            

            let graphdata1=${JSON.stringify(graphdata)};
            let battsoc1=${JSON.stringify(graphbattsoc)};
            let consumption1=${JSON.stringify(graphconsumption)};

            let options = {
          chart: {
            type: "area",
            height: 400,
            animations: {
              enabled: false
            },
            stacked: false
          },
          colors: ['#fc2c03','#9ef6f7','#117711'],
          stroke: {
            curve: "smooth",
            width: [2, 2, 2],
            colors : ['#ff0000','#0000ff','#117711'],
            show: true
          },
          dataLabels: {
            enabled: false
          },
          series: [{
            name: 'PVPower watts',
            data:  graphdata1,
            type: 'area'
          },{
            name: 'Consumption watts',
            data:  consumption1,
            type: 'line'
          },{
            name: 'Battery SOC',
            data:  battsoc1,
            type: 'line'
          }],
          xaxis: {
            type: "datetime",
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            },
            labels: {
              datetimeUTC: false
            }  
          },
          yaxis: [{
            seriesName: 'PVPower watts',
            labels: {
              offsetX: 14,
              offsetY: -5
            },
            tooltip: {
              enabled: false
            }
          },{
            seriesName: 'PVPower watts',
            show: false,
            tooltip: {
              enabled: false
            }
          },{
            seriesName: 'Battery SOC',
            opposite: true,
            title: {
              text: 'Battery %'
            }
          }],
          annotations: {
            xaxis: ${annot}
          },
          grid: {
            padding: {
              left: -5,
              right: 5
            }
          },
          tooltip: {
            x: {
              format: "yyyy-MM-dd HH:mm:ss"
            },
          },
          legend: {
            position: 'top',
            horizontalAlign: 'left'
          },
          fill: {
            opacity: [0.85, 0.25],
            type: "solid"
          }
        };


        //eachRecursive(options);
        console.log(options);

        let chart = new ApexCharts(document.querySelector("#chart_${id}"), options);
        chart.render();

      })();
      </script>

      `;

      return out;
    }

    static getchart=function(data,config,currentdata,history) {

      /*if (typeof data["type"] !== undefined && data["type"]==="energymodeltest1"){
        return charts._getdemochart(data,config);
      }
      */

      if (typeof data["type"] !== undefined && data["type"]==="maingraph"){

        if (history.length>0){

          return charts._getchart(data,config,currentdata,history);
          /*{
          "start_time": history[0]["timestamp"],
          "ah_min_point": 44,
          "ah_switch_point": 22,
          "ah_charge_point": 10,
          "current_ah": history[history.length-1]["battery_capacity_ah"],
          "current_mode": history[history.length-1]["OutputPriority_text"],
          "current_charge": history[history.length-1]["ChargerSourcePriority_text"],
          "consumption_a": 19,
          "voltage": 26,
          "ah_capacity": history[history.length-1]["battery_capacity_ah"],
          "self_consumption_a": 1.1,
          "charge_max_a": history[history.length-1]["MaxChargerCurrent"] 
          }*/
          
        }
      }
    }

}

module.exports=charts;