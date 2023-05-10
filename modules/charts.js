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
                    {"unixtime_now": "",\n"ah_min_point": 44,\n"ah_switch_point": 22,\n"ah_charge_point": 10,\n"current_ah": 100,\n"current_mode":"SBU",\n"current_charge":"OSO",\n"consumption_a":19,\n"voltage": 26}
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
        //run model from first to last date
        let mode="";
        for(let t=first_date;t<last_date;t=t+300){
            let newmode=energy.run(t,prediction,data.ah_min_point,data.ah_switch_point,data.ah_charge_point,data.current_ah,data.current_mode,data.current_charge,data.consumption_a,data.voltage);
            if (mode!=newmode){
               
            }
            graphdata.push([t*1000,newmode.predicted_data]);
        }  

             
        let out=`<script>

        let graphdata1=${JSON.stringify(graphdata)};

        var options = {
      chart: {
        type: "area",
        height: 400,
        animations: {
          enabled: false
        }
      },
      colors: ['#FFDF00'],
      stroke: {
        curve: "smooth",
        width: 0,
        show: false
      },
      dataLabels: {
        enabled: false
      },
      series: [{
        name: 'Forecast watts',
        data:  graphdata1
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
      yaxis: {
        labels: {
          offsetX: 14,
          offsetY: -5
        },
        tooltip: {
          enabled: false
        }
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
        type: "solid",
        fillOpacity: 0.5
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