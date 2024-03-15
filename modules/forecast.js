const helper = require("./helper.js");
let fs = require('fs');
const fetch = require('cross-fetch');

class energy {

    /**
     * Get forecast data: returns null if has no valid cached data
     * @param {string} url solar.forecast api URL
     * @param {number} update_period default 1800(min)
     * @returns null|object
     */
    static getforecast(url="",update_period=1800) {

      let forecastfile="forecast.json";
      let forecastrespfile="forecastresp.txt";

      let dataobj={};

      let file="";
      try {
        if (fs.existsSync(forecastfile)){
            file=fs.readFileSync(forecastfile,{encoding:'utf8', flag:'r'});
        }
      } catch (err) {
        console.log("ENERGY:",err);
        
      }
      
      if (file!=""){
        try{
          dataobj=JSON.parse(file);
        }catch(e){
          console.log("ENERGY: file parse error: ",e);
          
        }
      }

      //console.log("ENERGY: cached data:",dataobj);

      let data_ok=0;
      
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
          
          if (diff<(update_period*2)){
            data_ok=1;
          }
          
        }
      }  

      let stats=null;
      try{
         stats = fs.statSync(forecastrespfile);
      }catch(err) {
        console.log("ENERGY:",err);
      }
      const HOUR = 1000 * 60 * 60;
      const anHourAgo = Date.now() - HOUR;

      if (stats!==null && stats!==undefined && stats["mtime"]!==undefined && 
        stats["mtime"] && needfetch && stats.mtime>anHourAgo){

        console.log("ENERGY:","WARN: found "+forecastrespfile+" with date:"+helper.fdate(helper.unixTimestamp(stats.mtime))+" -> not fetching forecast data, probably rate limited in last hour!!!!!!");
        needfetch=0;

      }

      if (needfetch){
       
        if (url===""){
          console.log("ENERGY:","not fetching forecast data, model not enabled ??!!!!!!!");
          return null;
        }

        console.log("ENERGY:","fetching...", url);
        
        fetch(url,
          {
          method: "GET",
            headers: {
              "accept": "application/json"
            }
          })
          .then(function(res) { 
            console.log("ENERGY: fetched!");
            
            if (res["status"]!==undefined && res.status==429){  //rate limited
                
                //workaround: wait 1 hour before next try
                try {
                  fs.writeFileSync(forecastrespfile,helper.fdate(helper.unixTimestamp())+" -> response.status=429");
                  console.log("ENERGY: writing response file -> pobably rate limited, postpone fetch");
                } catch (err) {
                  console.log("ENERGY:",err);
                }

            }
            return res.text();
          } )
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
              console.log(json);
            }
          }).catch(err => {
            console.log("ENERGY:",err);
        });
          
      }

      //return null if file ok but too old
      if (data_ok) {
        return dataobj;  
      }else{
        return null;
      }
      
        
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

}

module.exports=energy;