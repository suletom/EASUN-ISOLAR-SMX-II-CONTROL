const helper = require("./helper.js");
let fs = require('fs');
const fetch = require('cross-fetch');

class energy {

     //energy management
        //inputs, to calculate SBU to UTI switch:
        // calculated remain time
        // current/predicted consuption
        // ah capacity to preserve
        // estimated start of sufficient sunlight: 
        // 1. solar api
        // 2. calculated start of production
        // if estimated power not enough -> turn to UTI

        // if estimated power seem to be enough -> turn to back to SBU

    /*    {
        "rv": rv,
        "ah_left": (finalah.toFixed(1)), 
        "remaining": remain,
        "soc":soc,
        "dischargetime":dischargetime,
        "errors":errorinfo,
        "state":state
        };

curl -X 'GET' \
  'https://api.forecast.solar/estimate/47.686482/17.604971/20/100/4' \
  -H 'accept: application/json' \
  -H 'X-Delimiter: |' \
  -H 'X-Separator: ;'

        */
   
    
    static getforecast(url,update_period=1800) {

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

      console.log("ENERGY: cached data:",dataobj);
      
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
                console.log("ENERGY: writing prediction to file: ",json);
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
              if (currentdata['OutputPriority_text']==="SBU" || 1){
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
              let availtime=helper.unixTimestamp()+(remain_time_h/3600);
              let avob=helper.fdateobj(availtime);


              if (prediction.result.watts[key]<batinf.current_consumption_a){

                addtext+=" *PV power not enough!";

              }

              if (key<avob.year+"-"+avob.mon+"-"+avob.day+" "+avob.hour+":"+avob.min+":"+avob.sec){
                addtext+=" *Capacity enough!";
              }
              
            }  
            

            out+=`<div class="small">${key} : ${prediction.result.watts[key]} ${addtext}</div>`;
          }  
        }
      }

      return out;
    }

    //determine if we need to buy from grid (based on the production) to preserve x% until the next sunny period
    calc(battery_capacity_ah,battery_current_ah,preserve_percent,continous_consuption_w){
      //let forecastresp={"result":{"watts":{"2023-04-24 05:44:20":0,"2023-04-24 06:00:00":169,"2023-04-24 07:00:00":442,"2023-04-24 08:00:00":827,"2023-04-24 09:00:00":1234,"2023-04-24 10:00:00":1466,"2023-04-24 11:00:00":1151,"2023-04-24 12:00:00":744,"2023-04-24 13:00:00":667,"2023-04-24 14:00:00":469,"2023-04-24 15:00:00":447,"2023-04-24 16:00:00":380,"2023-04-24 17:00:00":294,"2023-04-24 18:00:00":184,"2023-04-24 19:00:00":79,"2023-04-24 19:51:12":0,"2023-04-25 05:42:35":0,"2023-04-25 06:00:00":72,"2023-04-25 07:00:00":255,"2023-04-25 08:00:00":596,"2023-04-25 09:00:00":1005,"2023-04-25 10:00:00":1385,"2023-04-25 11:00:00":1619,"2023-04-25 12:00:00":1719,"2023-04-25 13:00:00":1719,"2023-04-25 14:00:00":1640,"2023-04-25 15:00:00":1391,"2023-04-25 16:00:00":1039,"2023-04-25 17:00:00":659,"2023-04-25 18:00:00":359,"2023-04-25 19:00:00":132,"2023-04-25 19:52:37":0},"watt_hours_period":{"2023-04-24 05:44:20":0,"2023-04-24 06:00:00":22,"2023-04-24 07:00:00":306,"2023-04-24 08:00:00":635,"2023-04-24 09:00:00":1031,"2023-04-24 10:00:00":1350,"2023-04-24 11:00:00":1309,"2023-04-24 12:00:00":948,"2023-04-24 13:00:00":706,"2023-04-24 14:00:00":568,"2023-04-24 15:00:00":458,"2023-04-24 16:00:00":414,"2023-04-24 17:00:00":337,"2023-04-24 18:00:00":239,"2023-04-24 19:00:00":132,"2023-04-24 19:51:12":34,"2023-04-25 05:42:35":0,"2023-04-25 06:00:00":10,"2023-04-25 07:00:00":164,"2023-04-25 08:00:00":426,"2023-04-25 09:00:00":801,"2023-04-25 10:00:00":1195,"2023-04-25 11:00:00":1502,"2023-04-25 12:00:00":1669,"2023-04-25 13:00:00":1719,"2023-04-25 14:00:00":1680,"2023-04-25 15:00:00":1516,"2023-04-25 16:00:00":1215,"2023-04-25 17:00:00":849,"2023-04-25 18:00:00":509,"2023-04-25 19:00:00":246,"2023-04-25 19:52:37":58},"watt_hours":{"2023-04-24 05:44:20":0,"2023-04-24 06:00:00":22,"2023-04-24 07:00:00":328,"2023-04-24 08:00:00":963,"2023-04-24 09:00:00":1994,"2023-04-24 10:00:00":3344,"2023-04-24 11:00:00":4653,"2023-04-24 12:00:00":5601,"2023-04-24 13:00:00":6307,"2023-04-24 14:00:00":6875,"2023-04-24 15:00:00":7333,"2023-04-24 16:00:00":7747,"2023-04-24 17:00:00":8084,"2023-04-24 18:00:00":8323,"2023-04-24 19:00:00":8455,"2023-04-24 19:51:12":8489,"2023-04-25 05:42:35":0,"2023-04-25 06:00:00":10,"2023-04-25 07:00:00":174,"2023-04-25 08:00:00":600,"2023-04-25 09:00:00":1401,"2023-04-25 10:00:00":2596,"2023-04-25 11:00:00":4098,"2023-04-25 12:00:00":5767,"2023-04-25 13:00:00":7486,"2023-04-25 14:00:00":9166,"2023-04-25 15:00:00":10682,"2023-04-25 16:00:00":11897,"2023-04-25 17:00:00":12746,"2023-04-25 18:00:00":13255,"2023-04-25 19:00:00":13501,"2023-04-25 19:52:37":13559},"watt_hours_day":{"2023-04-24":8489,"2023-04-25":13559}},"message":{"code":0,"type":"success","text":"","info":{"latitude":47.6866,"longitude":17.6045,"distance":0,"place":"64/A, Achim Andr\u00e1s utca, Szent Erzs\u00e9bet-telep, Gy\u0151r, Gy\u0151ri j\u00e1r\u00e1s, Gy\u0151r-Moson-Sopron v\u00e1rmegye, Nyugat-Dun\u00e1nt\u00fal, Dun\u00e1nt\u00fal, 9025, Magyarorsz\u00e1g","timezone":"Europe/Budapest","time":"2023-04-24T12:53:57+02:00","time_utc":"2023-04-24T10:53:57+00:00"},"ratelimit":{"period":3600,"limit":12,"remaining":11}}};
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



      let fok20={
        "result":{
           "watts":{
              "2023-04-26 05:40:50":0,
              "2023-04-26 06:00:00":157,
              "2023-04-26 07:00:00":297,
              "2023-04-26 08:00:00":591,
              "2023-04-26 09:00:00":988,
              "2023-04-26 10:00:00":1374,
              "2023-04-26 11:00:00":1655,
              "2023-04-26 12:00:00":1827,
              "2023-04-26 13:00:00":1911,
              "2023-04-26 14:00:00":2261,
              "2023-04-26 15:00:00":1981,
              "2023-04-26 16:00:00":1563,
              "2023-04-26 17:00:00":1138,
              "2023-04-26 18:00:00":725,
              "2023-04-26 19:00:00":287,
              "2023-04-26 19:54:01":0,
              "2023-04-27 05:39:06":0,
              "2023-04-27 06:00:00":96,
              "2023-04-27 07:00:00":195,
              "2023-04-27 08:00:00":415,
              "2023-04-27 09:00:00":853,
              "2023-04-27 10:00:00":1384,
              "2023-04-27 11:00:00":1841,
              "2023-04-27 12:00:00":2100,
              "2023-04-27 13:00:00":2209,
              "2023-04-27 14:00:00":2162,
              "2023-04-27 15:00:00":1815,
              "2023-04-27 16:00:00":1365,
              "2023-04-27 17:00:00":995,
              "2023-04-27 18:00:00":670,
              "2023-04-27 19:00:00":283,
              "2023-04-27 19:55:26":0
           },
           "watt_hours_period":{
              "2023-04-26 05:40:50":0,
              "2023-04-26 06:00:00":25,
              "2023-04-26 07:00:00":227,
              "2023-04-26 08:00:00":444,
              "2023-04-26 09:00:00":790,
              "2023-04-26 10:00:00":1181,
              "2023-04-26 11:00:00":1515,
              "2023-04-26 12:00:00":1741,
              "2023-04-26 13:00:00":1869,
              "2023-04-26 14:00:00":2086,
              "2023-04-26 15:00:00":2121,
              "2023-04-26 16:00:00":1772,
              "2023-04-26 17:00:00":1351,
              "2023-04-26 18:00:00":932,
              "2023-04-26 19:00:00":506,
              "2023-04-26 19:54:01":129,
              "2023-04-27 05:39:06":0,
              "2023-04-27 06:00:00":17,
              "2023-04-27 07:00:00":146,
              "2023-04-27 08:00:00":305,
              "2023-04-27 09:00:00":634,
              "2023-04-27 10:00:00":1119,
              "2023-04-27 11:00:00":1613,
              "2023-04-27 12:00:00":1971,
              "2023-04-27 13:00:00":2155,
              "2023-04-27 14:00:00":2186,
              "2023-04-27 15:00:00":1989,
              "2023-04-27 16:00:00":1590,
              "2023-04-27 17:00:00":1180,
              "2023-04-27 18:00:00":833,
              "2023-04-27 19:00:00":477,
              "2023-04-27 19:55:26":131
           },
           "watt_hours":{
              "2023-04-26 05:40:50":0,
              "2023-04-26 06:00:00":25,
              "2023-04-26 07:00:00":252,
              "2023-04-26 08:00:00":696,
              "2023-04-26 09:00:00":1486,
              "2023-04-26 10:00:00":2667,
              "2023-04-26 11:00:00":4182,
              "2023-04-26 12:00:00":5923,
              "2023-04-26 13:00:00":7792,
              "2023-04-26 14:00:00":9878,
              "2023-04-26 15:00:00":11999,
              "2023-04-26 16:00:00":13771,
              "2023-04-26 17:00:00":15122,
              "2023-04-26 18:00:00":16054,
              "2023-04-26 19:00:00":16560,
              "2023-04-26 19:54:01":16689,
              "2023-04-27 05:39:06":0,
              "2023-04-27 06:00:00":17,
              "2023-04-27 07:00:00":163,
              "2023-04-27 08:00:00":468,
              "2023-04-27 09:00:00":1102,
              "2023-04-27 10:00:00":2221,
              "2023-04-27 11:00:00":3834,
              "2023-04-27 12:00:00":5805,
              "2023-04-27 13:00:00":7960,
              "2023-04-27 14:00:00":10146,
              "2023-04-27 15:00:00":12135,
              "2023-04-27 16:00:00":13725,
              "2023-04-27 17:00:00":14905,
              "2023-04-27 18:00:00":15738,
              "2023-04-27 19:00:00":16215,
              "2023-04-27 19:55:26":16346
           },
           "watt_hours_day":{
              "2023-04-26":16689,
              "2023-04-27":16346
           }
        },
        "message":{
           "code":0,
           "type":"success",
           "text":"",
           "info":{
              "latitude":47.6866,
              "longitude":17.6045,
              "distance":0,
              "place":"64/A, Achim Andr\u00e1s utca, Szent Erzs\u00e9bet-telep, Gy\u0151r, Gy\u0151ri j\u00e1r\u00e1s, Gy\u0151r-Moson-Sopron v\u00e1rmegye, Nyugat-Dun\u00e1nt\u00fal, Dun\u00e1nt\u00fal, 9025, Magyarorsz\u00e1g",
              "timezone":"Europe/Budapest",
              "time":"2023-04-26T11:56:59+02:00",
              "time_utc":"2023-04-26T09:56:59+00:00"
           },
           "ratelimit":{
              "period":3600,
              "limit":12,
              "remaining":11
           }
        }
     };

    let fok12={
      "result":{
         "watts":{
            "2023-04-26 05:40:50":0,
            "2023-04-26 06:00:00":176,
            "2023-04-26 07:00:00":449,
            "2023-04-26 08:00:00":836,
            "2023-04-26 09:00:00":1245,
            "2023-04-26 10:00:00":1603,
            "2023-04-26 11:00:00":1820,
            "2023-04-26 12:00:00":1922,
            "2023-04-26 13:00:00":1935,
            "2023-04-26 14:00:00":2203,
            "2023-04-26 15:00:00":1864,
            "2023-04-26 16:00:00":1417,
            "2023-04-26 17:00:00":989,
            "2023-04-26 18:00:00":600,
            "2023-04-26 19:00:00":233,
            "2023-04-26 19:54:01":0,
            "2023-04-27 05:39:06":0,
            "2023-04-27 06:00:00":106,
            "2023-04-27 07:00:00":268,
            "2023-04-27 08:00:00":568,
            "2023-04-27 09:00:00":1071,
            "2023-04-27 10:00:00":1616,
            "2023-04-27 11:00:00":2028,
            "2023-04-27 12:00:00":2211,
            "2023-04-27 13:00:00":2215,
            "2023-04-27 14:00:00":2107,
            "2023-04-27 15:00:00":1710,
            "2023-04-27 16:00:00":1240,
            "2023-04-27 17:00:00":867,
            "2023-04-27 18:00:00":556,
            "2023-04-27 19:00:00":230,
            "2023-04-27 19:55:26":0
         },
         "watt_hours_period":{
            "2023-04-26 05:40:50":0,
            "2023-04-26 06:00:00":28,
            "2023-04-26 07:00:00":313,
            "2023-04-26 08:00:00":643,
            "2023-04-26 09:00:00":1041,
            "2023-04-26 10:00:00":1424,
            "2023-04-26 11:00:00":1712,
            "2023-04-26 12:00:00":1871,
            "2023-04-26 13:00:00":1929,
            "2023-04-26 14:00:00":2069,
            "2023-04-26 15:00:00":2034,
            "2023-04-26 16:00:00":1641,
            "2023-04-26 17:00:00":1203,
            "2023-04-26 18:00:00":795,
            "2023-04-26 19:00:00":417,
            "2023-04-26 19:54:01":105,
            "2023-04-27 05:39:06":0,
            "2023-04-27 06:00:00":18,
            "2023-04-27 07:00:00":187,
            "2023-04-27 08:00:00":418,
            "2023-04-27 09:00:00":820,
            "2023-04-27 10:00:00":1344,
            "2023-04-27 11:00:00":1822,
            "2023-04-27 12:00:00":2120,
            "2023-04-27 13:00:00":2213,
            "2023-04-27 14:00:00":2161,
            "2023-04-27 15:00:00":1909,
            "2023-04-27 16:00:00":1475,
            "2023-04-27 17:00:00":1054,
            "2023-04-27 18:00:00":712,
            "2023-04-27 19:00:00":393,
            "2023-04-27 19:55:26":106
         },
         "watt_hours":{
            "2023-04-26 05:40:50":0,
            "2023-04-26 06:00:00":28,
            "2023-04-26 07:00:00":341,
            "2023-04-26 08:00:00":984,
            "2023-04-26 09:00:00":2025,
            "2023-04-26 10:00:00":3449,
            "2023-04-26 11:00:00":5161,
            "2023-04-26 12:00:00":7032,
            "2023-04-26 13:00:00":8961,
            "2023-04-26 14:00:00":11030,
            "2023-04-26 15:00:00":13064,
            "2023-04-26 16:00:00":14705,
            "2023-04-26 17:00:00":15908,
            "2023-04-26 18:00:00":16703,
            "2023-04-26 19:00:00":17120,
            "2023-04-26 19:54:01":17225,
            "2023-04-27 05:39:06":0,
            "2023-04-27 06:00:00":18,
            "2023-04-27 07:00:00":205,
            "2023-04-27 08:00:00":623,
            "2023-04-27 09:00:00":1443,
            "2023-04-27 10:00:00":2787,
            "2023-04-27 11:00:00":4609,
            "2023-04-27 12:00:00":6729,
            "2023-04-27 13:00:00":8942,
            "2023-04-27 14:00:00":11103,
            "2023-04-27 15:00:00":13012,
            "2023-04-27 16:00:00":14487,
            "2023-04-27 17:00:00":15541,
            "2023-04-27 18:00:00":16253,
            "2023-04-27 19:00:00":16646,
            "2023-04-27 19:55:26":16752
         },
         "watt_hours_day":{
            "2023-04-26":17225,
            "2023-04-27":16752
         }
      },
      "message":{
         "code":0,
         "type":"success",
         "text":"",
         "info":{
            "latitude":47.6866,
            "longitude":17.6045,
            "distance":0,
            "place":"64/A, Achim Andr\u00e1s utca, Szent Erzs\u00e9bet-telep, Gy\u0151r, Gy\u0151ri j\u00e1r\u00e1s, Gy\u0151r-Moson-Sopron v\u00e1rmegye, Nyugat-Dun\u00e1nt\u00fal, Dun\u00e1nt\u00fal, 9025, Magyarorsz\u00e1g",
            "timezone":"Europe/Budapest",
            "time":"2023-04-26T11:57:24+02:00",
            "time_utc":"2023-04-26T09:57:24+00:00"
         },
         "ratelimit":{
            "period":3600,
            "limit":12,
            "remaining":10
         }
      }
   };


    }  
    
}

module.exports=energy;