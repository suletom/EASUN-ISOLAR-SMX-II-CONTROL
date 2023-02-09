let fs = require('fs');

var commands={};
let cdata=fs.readFileSync('commands.json',{encoding:'utf8', flag:'r'});

try{ 
    commands=JSON.parse(cdata);
}catch(e){
    console.log(e);
}

let tmp=commands.commands.find(el => el.name === "get_smx_param" );

let arr=tmp.definition;
//console.log(arr);

let out="";
let outsws="";

arr.forEach(function(el){
let val=el.name.replace(/ /g,"_");

var unit="";

if (typeof el.unit === "string"){
  unit='unit_of_measurement: "'+el.unit+'"';
}



var template=`

  - platform: command_line
    name: ${val}
    unique_id: easun-isolar-smx-ii.${val}
    command: "cat /config/currentdata.json"
    json_attributes:
      - "${val}"
    value_template: "{{ value_json['${val}'] }}"
    ${unit}
    scan_interval: 60`
    
    out+=template;

});

console.log(out);