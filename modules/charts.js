const energy1 = require("./energy_ver1.js");
const forecast = require("./forecast.js");
const helper = require("./helper.js");

class charts{

    static getchartinfo=function(){

        //model test chart
        //{"unixtime,prediction,ah_min_point,ah_switch_point,ah_charge_point,current_ah,current_mode,current_charge,consumption_a,voltage"}

        let html=`<div>
                    <label>Energy model v1 test</label>
                    <textarea>
                    {"start_time": "now",\n
                    "ah_min_point": 44,\n
                    "ah_switch_point": 22,\n
                    "ah_charge_point": 10,\n
                    "current_ah": 100,\n
                    "current_mode":"SBU",\n
                    "current_charge":"OSO",\n
                    "consumption_a":19,\n
                    "voltage": 26,\n
                    "ah_capacity":220,\n
                    "self_consumption_a":1.1,\n
                    "charge_max_a":65
                    }
                    </textarea>
                    <button class="btn btn-primary" onclick="getchart('energymodeltest1');">Show chart!</button>
                   </div>`;

        return [
            {'id':'energymodeltest1','html':html}
        ];
    }
    
    static getchart=function(data){

        let start_time="";
        if (data.start_time=="now"){
           start_time=helper.unixTimestamp()
        }else{
           start_time=data.start_time;
        }
        
        let prediction=forecast.getforecast("https://api.forecast.solar/estimate/47.686482/17.604971/20/100/4");


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

        let energy=new energy1();

        let graphdata=[];
        let graphbattsoc=[];
        let graphconsumption=[];

        //run model from first to last date
        let mode="";
        let chargemode="";
        let annot=[];
        let modcol={"SBU":"#20b024","UTI":"#775DD0","OSO":"#ced10a","SNU":"#e62929"};

        let max_main=0;
        let min_main=Infinity;

        let stepping=120; //sec

        for(let t=first_date;t<last_date;t=t+stepping){

            let newmode=energy.run(t,prediction,data.ah_min_point,data.ah_switch_point,data.ah_charge_point,data.current_ah,data.current_mode,data.ah_capacity,data.current_charge,data.consumption_a,data.voltage,data.charge_max_a);
            if (max_main<newmode.predicted_data){
              max_main=newmode.predicted_data;
            }
            if (min_main>newmode.predicted_data){
              min_main=newmode.predicted_data;
            }

        }

        for(let t=first_date;t<last_date;t=t+stepping){
            
            let newmode=energy.run(t,prediction,data.ah_min_point,data.ah_switch_point,data.ah_charge_point,data.current_ah,data.current_mode,data.ah_capacity,data.current_charge,data.consumption_a,data.voltage,data.charge_max_a);

            if (helper.unixTimestamp()<t && helper.unixTimestamp()>t-stepping){
              let now={
                "x": t*1000,
                "borderColor": "#000",
                "label": {
                  "borderColor": "#000",
                  "style": {
                    "color": "#fff",
                    "background": "#222",
                  },
                  "text": "NOW"
                }
              };
              annot.push(now);
            }  
            
            if (t>show_time) {

              if (mode!=newmode.suggested_mode){
                let ob={
                  "x": t*1000,
                  "borderColor": modcol[newmode.suggested_mode],
                  "label": {
                    "borderColor": modcol[newmode.suggested_mode],
                    "style": {
                      "color": "#fff",
                      "background": modcol[newmode.suggested_mode],
                    },
                    "text": newmode.suggested_mode+": "+data.current_ah.toFixed(4)+"-"+(data.consumption_a*data.voltage)
                  }
                };
                annot.push(ob);
                
              }
              if (chargemode!=newmode.suggested_charge){
                let ob1={
                  "x": t*1000,
                  "borderColor": modcol[newmode.suggested_charge],
                  "label": {
                    "borderColor": modcol[newmode.suggested_charge],
                    "style": {
                      "color": "#fff",
                      "background": modcol[newmode.suggested_charge],
                    },
                    "text": newmode.suggested_charge,
                    "offsetY": -38
                  }
                };
                annot.push(ob1);
              }
              
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
              if (mode=="SBU"){
                //calculated consuption
                new_current_ah+=(-(stepping/3600)*data.consumption_a);
                new_current_ah+=(-(stepping/3600)*data.self_consumption_a);
              }else{
                if (mode=="UTI"){
                  //only self consuption
                  new_current_ah+=(-(stepping/3600)*data.self_consumption_a);
                }
              }
                          
              let charge=0;

              if (chargemode=="SNU"){
                charge=(stepping/3600)*data.charge_max_a;
              }else{
                charge=(( newmode.predicted_data/data.voltage));

                //limit charger amps
                if (charge>data.charge_max_a){
                  charge=data.charge_max_a;
                }

                charge=charge*(stepping/3600);
              }

              //solar charge
              new_current_ah+=charge;

              data.current_ah=new_current_ah;

              if (data.current_ah>data.ah_capacity){
                data.current_ah=data.ah_capacity;
              }
              if (data.current_ah<0){
                data.current_ah=0;
              }

              data.current_mode=mode;
              data.current_charge=chargemode;
            }  
        }
             
        let out=`<script>

        var graphdata1=${JSON.stringify(graphdata)};
        var battsoc1=${JSON.stringify(graphbattsoc)};
        var consumption1=${JSON.stringify(graphconsumption)};

        var options = {
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
        name: 'Forecast watts',
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
        seriesName: 'Forecast watts',
        labels: {
          offsetX: 14,
          offsetY: -5
        },
        tooltip: {
          enabled: false
        }
      },{
        seriesName: 'Forecast watts',
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

    var chart = new ApexCharts(document.querySelector("#charttest1"), options);

    chart.render();

        </script>
        <div id="charttest1"></div>
        `

        return out;
    }

}

module.exports=charts;