const helper = require("./helper.js");
let fs = require('fs');
const fetch = require('cross-fetch');

class energy {

    static getforecast(url="",update_period=1800) {

      let forecastfile="forecast.json";

      let file="";
      try {
        if (fs.existsSync(forecastfile)){
            file=fs.readFileSync(forecastfile,{encoding:'utf8', flag:'r'});
        }
      } catch (err) {
        console.log("ENERGY:",err);
      }

      let dataobj={};

      if (file!=""){
        try{
          dataobj=JSON.parse(file);
        }catch(e){
            console.log("ENERGY:",e);
        }
      }

      //console.log("ENERGY: cached data:",dataobj);
      
      let needfetch=0;
      if (file==="" ){
        console.log("ENERGY:","need to fetch predicted data: no file cached");    
        needfetch=1;        
      }

      if (dataobj["message"]===undefined || dataobj["message"]["info"]===undefined || dataobj["message"]["info"]["time"]===undefined){
        console.log("ENERGY:","need to fetch predicted data: no valid data in cached file");    
        needfetch=1;
      }else{
        let filedate=dataobj["message"]["info"]["time"];
        if (filedate!==undefined){
          let d=new Date(filedate);
          let nd=new Date();
          let diff=(nd.getTime()-d.getTime())/1000;
          if (diff>update_period){
            console.log("ENERGY:","need to fetch predicted data: file too old", url);    
            needfetch=1;
          }
        }
      }  

      if (needfetch){

        if (url===""){
          console.log("ENERGY:","not fetching forecast data, model not enabled ??!!!!!!!");
          return dataobj;
        }

        console.log("ENERGY:","fetching...", url);
        
        fetch(url,
          {
          method: "GET",
            headers: {
              "accept": "application/json"
            }
          })
          .then(function(res) {  console.log("ENERGY: fetched!"); return res.text() } )
          .then(text => JSON.parse(text))
          .then(function(json) {
          
            if (json["message"] != undefined && json.message.code===0 && json.message.type==="success" &&  json.message.info.time != undefined ){
              try {
                dataobj=json;
                fs.writeFileSync(forecastfile,JSON.stringify(json));
                console.log("ENERGY: writing prediction to file.");
              } catch (err) {
                console.log("ENERGY:",err);
              }
            }else{
              console.log("ENERGY: json content not valid!");
            }
          }).catch(err => {
            console.log("ENERGY:",err);
          });
          
        }
        return dataobj;
        
    }

    static search_sunsets(data,now=null){

      if (now===null) now=helper.unixTimestamp();

      let sunsets=[];
      //search for sunset
      let sunset=0;
      let sunset_date=null;
      let lastel=null;
      for(let key in data) {
          let predtime=helper.unixTimestamp(new Date(key));

          if (data[key]==0){
            
            let dob=helper.fdateobj(predtime);

            if (sunset!=0 && sunset_date.day!=dob.day){
              sunsets.push(sunset);
              sunset_date=null;
              sunset=0;
            }

            sunset=predtime;
            sunset_date=dob;
          }

          lastel={"predtime":predtime,"val":data[key]};
      }

      if (lastel!==null && lastel.val==0){
        sunsets.push(lastel.predtime);
      }

      let next_sunset=0;
      for(let i=0;i<sunsets.length;i++) {
          if (now<sunsets[i]){
            next_sunset=sunsets[i];
          }
      }
      let so = {"sunsets":sunsets,"next_sunset":next_sunset};
      
      return so;
    }

    /*
    static run(currentdata,batinf,url,preserve_ah){
      //https://api.forecast.solar/estimate/47.686482/17.604971/20/100/4
      let prediction=energy.getforecast(url);
      console.log("ENERGY: run!");

      let out="";
      let dob=helper.fdateobj(helper.unixTimestamp()-7200);
      let datestr=dob.year+"-"+dob.mon+"-"+dob.day+" "+dob.hour+":00:00";

      let nh=helper.fdateobj(helper.unixTimestamp()+3600);
      let nexthourstr=nh.year+"-"+nh.mon+"-"+nh.day+" "+nh.hour+":00:00";
  
      let remain_time_h=0;

      if (prediction.result!=undefined && prediction.result.watts!=undefined){
        console.log("ENERGY: prediction.result ok!");
        for(let key in prediction.result.watts){
          console.log("ENERGY: checking: ",key," ",prediction.result.watts[key]);
          let addtext="";

          if (key>=datestr){

            //check at current hour
            if (key<nexthourstr){
              addtext=" *check time!";
              if (currentdata['OutputPriority_text']==="SBU"){
                addtext+=" @SBU";
                if (prediction.result.watts[key]==0){
                  addtext+=" Sunset!?";

                  if (batinf.rv==1){
                    addtext+=" Battery:OK!";

                    console.log("ENERGY: battery_ah: ",batinf.ah_left," preserve: ",preserve_ah);

                    let usable_ah=(batinf.ah_left-preserve_ah);
                    addtext+=" USABLE AH: "+usable_ah.toFixed(1);
                    
                    console.log(batinf);
                    remain_time_h=usable_ah/batinf.current_consumption_a;
                    addtext+=" Time: "+remain_time_h.toFixed(2)+" h";

                  }
                }
              }else{

                if(currentdata['OutputPriority_text']==="UTI"){
                  addtext+=" @UTI";
                }else{
                  addtext+=" @"+currentdata['OutputPriority_text']+" -> NO ACTION!";
                }
              }

            }

            if (remain_time_h>0){
              let availtime=helper.unixTimestamp()+(remain_time_h*3600);
              let avob=helper.fdateobj(availtime);

              //addtext+=" ENDTime: "+helper.fdate(availtime);
              
              if (prediction.result.watts[key]<batinf.current_consumption_a){

                addtext+=" *PV power not enough!";

              }else{
                addtext+=" *PV power enough!";
              }

              if (key<avob.year+"-"+avob.mon+"-"+avob.day+" "+avob.hour+":"+avob.min+":"+avob.sec){
                addtext+=" *Capacity enough!";
              }else{
                addtext+=" *Capacity not enough!";
              }
              
            }
            
            out+=`<div class="small">${key} : ${prediction.result.watts[key]} ${addtext}</div>`;
          }  
        }
      }

      return out;
    }

    //testdata
    calc(){
      
      let forecastresp1={
        "result": {
          "watts": {
            "2023-04-26 05:40:50": 0,
            "2023-04-26 06:00:00": 176,
            "2023-04-26 07:00:00": 449,
            "2023-04-26 08:00:00": 863,
            "2023-04-26 09:00:00": 1334,
            "2023-04-26 10:00:00": 1646,
            "2023-04-26 11:00:00": 2298,
            "2023-04-26 12:00:00": 2481,
            "2023-04-26 13:00:00": 2451,
            "2023-04-26 14:00:00": 2357,
            "2023-04-26 15:00:00": 2019,
            "2023-04-26 16:00:00": 1553,
            "2023-04-26 17:00:00": 1090,
            "2023-04-26 18:00:00": 639,
            "2023-04-26 19:00:00": 242,
            "2023-04-26 19:54:01": 0,
            "2023-04-27 05:39:06": 0,
            "2023-04-27 06:00:00": 109,
            "2023-04-27 07:00:00": 279,
            "2023-04-27 08:00:00": 548,
            "2023-04-27 09:00:00": 904,
            "2023-04-27 10:00:00": 1260,
            "2023-04-27 11:00:00": 1541,
            "2023-04-27 12:00:00": 1732,
            "2023-04-27 13:00:00": 1813,
            "2023-04-27 14:00:00": 1724,
            "2023-04-27 15:00:00": 1431,
            "2023-04-27 16:00:00": 1088,
            "2023-04-27 17:00:00": 774,
            "2023-04-27 18:00:00": 481,
            "2023-04-27 19:00:00": 197,
            "2023-04-27 19:55:26": 0
          },
          "watt_hours_period": {
            "2023-04-26 05:40:50": 0,
            "2023-04-26 06:00:00": 28,
            "2023-04-26 07:00:00": 313,
            "2023-04-26 08:00:00": 656,
            "2023-04-26 09:00:00": 1099,
            "2023-04-26 10:00:00": 1490,
            "2023-04-26 11:00:00": 1972,
            "2023-04-26 12:00:00": 2390,
            "2023-04-26 13:00:00": 2466,
            "2023-04-26 14:00:00": 2404,
            "2023-04-26 15:00:00": 2188,
            "2023-04-26 16:00:00": 1786,
            "2023-04-26 17:00:00": 1322,
            "2023-04-26 18:00:00": 865,
            "2023-04-26 19:00:00": 441,
            "2023-04-26 19:54:01": 109,
            "2023-04-27 05:39:06": 0,
            "2023-04-27 06:00:00": 19,
            "2023-04-27 07:00:00": 194,
            "2023-04-27 08:00:00": 414,
            "2023-04-27 09:00:00": 726,
            "2023-04-27 10:00:00": 1082,
            "2023-04-27 11:00:00": 1401,
            "2023-04-27 12:00:00": 1637,
            "2023-04-27 13:00:00": 1773,
            "2023-04-27 14:00:00": 1769,
            "2023-04-27 15:00:00": 1578,
            "2023-04-27 16:00:00": 1260,
            "2023-04-27 17:00:00": 931,
            "2023-04-27 18:00:00": 628,
            "2023-04-27 19:00:00": 339,
            "2023-04-27 19:55:26": 91
          },
          "watt_hours": {
            "2023-04-26 05:40:50": 0,
            "2023-04-26 06:00:00": 28,
            "2023-04-26 07:00:00": 341,
            "2023-04-26 08:00:00": 997,
            "2023-04-26 09:00:00": 2096,
            "2023-04-26 10:00:00": 3586,
            "2023-04-26 11:00:00": 5558,
            "2023-04-26 12:00:00": 7948,
            "2023-04-26 13:00:00": 10414,
            "2023-04-26 14:00:00": 12818,
            "2023-04-26 15:00:00": 15006,
            "2023-04-26 16:00:00": 16792,
            "2023-04-26 17:00:00": 18114,
            "2023-04-26 18:00:00": 18979,
            "2023-04-26 19:00:00": 19420,
            "2023-04-26 19:54:01": 19529,
            "2023-04-27 05:39:06": 0,
            "2023-04-27 06:00:00": 19,
            "2023-04-27 07:00:00": 213,
            "2023-04-27 08:00:00": 627,
            "2023-04-27 09:00:00": 1353,
            "2023-04-27 10:00:00": 2435,
            "2023-04-27 11:00:00": 3836,
            "2023-04-27 12:00:00": 5473,
            "2023-04-27 13:00:00": 7246,
            "2023-04-27 14:00:00": 9015,
            "2023-04-27 15:00:00": 10593,
            "2023-04-27 16:00:00": 11853,
            "2023-04-27 17:00:00": 12784,
            "2023-04-27 18:00:00": 13412,
            "2023-04-27 19:00:00": 13751,
            "2023-04-27 19:55:26": 13842
          },
          "watt_hours_day": {
            "2023-04-26": 19529,
            "2023-04-27": 13842
          }
        },
        "message": {
          "code": 0,
          "type": "success",
          "text": "",
          "info": {
            "latitude": 47.6866,
            "longitude": 17.6045,
            "distance": 0,
            "place": "64/A, Achim András utca, Szent Erzsébet-telep, Győr, Győri járás, Győr-Moson-Sopron vármegye, Nyugat-Dunántúl, Dunántúl, 9025, Magyarország",
            "timezone": "Europe/Budapest",
            "time": "2023-04-26T09:54:30+02:00",
            "time_utc": "2023-04-26T07:54:30+00:00"
          },
          "ratelimit": {
            "period": 3600,
            "limit": 12,
            "remaining": 4
          }
        }
      };

    }
    */
}

module.exports=energy;