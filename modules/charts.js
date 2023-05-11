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
                    {"unixtime_now": "",\n
                    "ah_min_point": 44,\n
                    "ah_switch_point": 22,\n
                    "ah_charge_point": 10,\n
                    "current_ah": 100,\n
                    "current_mode":"SBU",\n
                    "current_charge":"OSO",\n
                    "consumption_a":19,\n
                    "voltage": 26,\n
                    "ah_capacity":220,\n
                    "self_consumption_a":1.1\n
                    }
                    </textarea>
                    <button class="btn btn-primary" onclick="getchart('energymodeltest1');">Show chart!</button>
                   </div>`;

        return [
            {'id':'energymodeltest1','html':html}
        ];
    }
    
    static getchart=function(data){

        let unixtime=data.unixtime_now==""?helper.unixTimestamp():data.unixtime_now;
        let prediction=forecast.getforecast("https://api.forecast.solar/estimate/47.686482/17.604971/20/100/4");


        let first_date="";
        let last_date="";
        for(let key in prediction.result.watts) {

            if (first_date=="") first_date=helper.unixTimestamp(new Date(key));
            last_date=helper.unixTimestamp(new Date(key));

        }

        let energy=new energy1();

        let graphdata=[];
        let battsoc=[];

        //run model from first to last date
        let mode="";
        let chargemode="";
        let annot=[];
        let modcol={"SBU":"#20b024","UTI":"#775DD0","OSO":"#ced10a","SNU":"#e62929"};

        let max_main=0;
        let min_main=Infinity;

        let stepping=120; //sec

        for(let t=first_date;t<last_date;t=t+stepping){
            let newmode=energy.run(t,prediction,data.ah_min_point,data.ah_switch_point,data.ah_charge_point,data.current_ah,data.current_mode,data.current_charge,data.consumption_a,data.voltage);
            if (max_main<newmode.predicted_data){
              max_main=newmode.predicted_data;
            }
            if (min_main>newmode.predicted_data){
              min_main=newmode.predicted_data;
            }

        }

        for(let t=first_date;t<last_date;t=t+stepping){
            let newmode=energy.run(t,prediction,data.ah_min_point,data.ah_switch_point,data.ah_charge_point,data.current_ah,data.current_mode,data.current_charge,data.consumption_a,data.voltage);
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
                  "text": newmode.suggested_mode
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
                  "text": newmode.suggested_charge
                }
              };
              annot.push(ob1);
            }
            
            mode=newmode.suggested_mode;
            chargemode=newmode.suggested_charge;
            graphdata.push([t*1000,newmode.predicted_data]);

            battsoc.push([t*1000, Math.round((data.current_ah/data.ah_capacity)*100) ]);

            //simulate dischare/charge for next cycle..
            data.current_ah=(
              data.current_ah+
              (mode=="SBU"?(-(stepping/3600)*data.consumption_a):(-(stepping/3600)*data.self_consumption_a)) + 
              ((stepping/3600)*( newmode.predicted_data/data.voltage)) 
            );

            if (data.current_ah>data.ah_capacity){
              data.current_ah=data.ah_capacity;
            }
            if (data.current_ah<0){
              data.current_ah=0;
            }
        }
             
        let out=`<script>

        var graphdata1=${JSON.stringify(graphdata)};
        var battsoc1=${JSON.stringify(battsoc)};

        var options = {
      chart: {
        type: "area",
        height: 400,
        animations: {
          enabled: false
        },
        stacked: false
      },
      colors: ['#fc2c03','#faf2d4'],
      stroke: {
        curve: "smooth",
        width: [2, 2,2 ],
        colors : ['#ff0000','#117711'],
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
        name: 'Battery SOC',
        data:  battsoc1,
        type: 'area'
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
        labels: {
          offsetX: 14,
          offsetY: -5
        },
        tooltip: {
          enabled: false
        }
      },{
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