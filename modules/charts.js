const energymodels = require("./energymodels.js");
const energyv1 = require("./energy_ver1.js"); 
const forecast = require("./forecast.js");
const helper = require("./helper.js");

class charts{

    static modcols={"SBU":"#20b024","UTI":"#775DD0","OSO":"#ced10a","SNU":"#e62929"};

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
            {'id':'energymodeltest1','html':html}
        ];
    }
    

    
    static _getdemochart=function(data){

        let start_time="";
        if (data.start_time=="now"){
           start_time=helper.unixTimestamp()
        }else{
           start_time=data.start_time;
        }
        
        let prediction=forecast.getforecast();


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

        let energy=new energyv1();

        let graphdata=[];
        let graphbattsoc=[];
        let graphconsumption=[];

        //run model from first to last date
        let mode="";
        let chargemode="";
        let annot=[];
        

        let stepping=120; //sec


        for(let t=first_date;t<last_date;t=t+stepping){
            console.log("CM: "+data.current_mode);
            let newmode=energy.run(t,prediction,data.ah_min_point,data.ah_switch_point,data.ah_charge_point,data.preserve_ah,data.current_ah,data.current_mode,data.ah_capacity,data.current_charge,data.consumption_a,data.voltage,data.charge_max_a);

            if (start_time<t && start_time>t-stepping){

              let now=charts.annot(start_time,'#000',"NOW",'#fff',{"offsetY": 80})

              annot.push(now);
            }  
            
            if (t>show_time) {

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
              if (mode=="SBU"){
                //calculated consuption
                new_current_ah+=(-(stepping/3600)*data.consumption_a);
                new_current_ah+=(-(stepping/3600)*data.self_consumption_a);
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
                  charge=(( newmode.predicted_data/data.voltage));

                  //limit charger amps
                  if (charge>data.charge_max_a){
                    charge=data.charge_max_a;
                  }

                  charge=charge*(stepping/3600);
                }  
                console.log("charget:",charge);
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

      let prediction=forecast.getforecast();

      let annot=[];
      let outputmode="";
      let chargemode="";
      let graphdata=[];
      let graphbattsoc=[];
      let graphconsumption=[];

      let lastts=0;
      for(let cv=0;cv<history.length;cv++){

        if (history[cv]["timestamp"] < start_time) continue;

        if (history[cv]['OutputPriority_text']!=outputmode) {

          annot.push(
            charts.annot(history[cv]["timestamp"],charts.modcols[history[cv]['OutputPriority_text']],history[cv]['OutputPriority_text'],'#000')
          );
        }  

        if (chargemode!=history[cv]['ChargerSourcePriority_text']){

          let ta=charts.annot(history[cv]["timestamp"],charts.modcols[history[cv]['ChargerSourcePriority_text']],history[cv]['ChargerSourcePriority_text'],
          '#000',{"offsetY": -38}
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

     
      //mode=newmode.suggested_mode;
      //chargemode=newmode.suggested_charge;

      let energymodel = new energymodels();

      for(let key in prediction.result.watts) {
          let predtime=helper.unixTimestamp(new Date(key));

          if (predtime > lastts) {

            let newmode=energymodel.run(config,currentdata,history);
            
            
            if (outputmode!=newmode.suggested_mode){
              
              annot.push(
                charts.annot(helper.unixTimestamp(),charts.modcols[newmode.suggested_mode],newmode.suggested_mode,'#000')
              );
            }

            if (chargemode!=newmode.suggested_charge){
              annot.push(
                charts.annot(helper.unixTimestamp(),charts.modcols[newmode.suggested_charge],newmode.suggested_charge, '#000',{"offsetY": -38})
              );
            }

            graphdata.push([predtime*1000,prediction.result.watts[key]]);
            lastts=lastts+300;
          }
      }
    
      return charts._graph("chartn",graphdata,graphbattsoc,graphconsumption,annot);
    };

    static _graph=function(id,graphdata,graphbattsoc,graphconsumption,annot=[]){

          let out=`
          <div id="chart_${id}"></div>

          <script>

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
            xaxis: ${JSON.stringify(annot)}
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

        let chart = new ApexCharts(document.querySelector("#chart_${id}"), options);
        chart.render();

      })();
      </script>

      `;

      return out;
    }

    static getchart=function(data,config,currentdata,history) {

      if (typeof data["type"] !== undefined && data["type"]==="energymodeltest1"){
        return charts._getdemochart(data);
      }
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