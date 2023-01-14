var arr=[{"num":"104","name":"MachineState","address":"0210","type":"UInt16BE","rate":1,"format": 0,"unit":["Power on","Stand by","Initialization","Soft start","Running in line","Running in inverter","Invert to line","Line to invert","remain","remain","Shutdown","Fault"]},
                {"num":"105","name":"Current fault","address":"0204","type":4,"format":101,"unit":["OK"]},
                {"num":"106","name":"PVVoltage","address":"0107","type":"UInt16BE","rate":0.1,"format": 1,"unit":"V"},
                {"num":"107","name":"PVCurrent","address":"0108","type":"UInt16BE","rate":0.1,"format": 1,"unit":"A"},
                {"num":"108","name":"PVPower","address":"0109","type":"UInt16BE","rate":1,"format": 1,"unit":"W"},
                {"num":"109","name":"LineVoltage","address":"0213","type":"UInt16BE","rate":0.1,"format": 1,"unit":"V"},
                {"num":"110","name":"LineCurrent","address":"0214","type":"UInt16BE","rate":0.1,"format": 1,"unit":"A"},
                {"num":"111","name":"LineFrequency","address":"0215","type":"UInt16BE","rate":0.01,"format": 2,"unit":"Hz"},
                {"num":"112","name":"BatteryVoltage","address":"0101","type":"UInt16BE","rate":0.1,"format": 1,"unit":"V"},
                {"num":"113","name":"BatteryCurrent","address":"0102","type":"Int16BE","rate":0.1,"format": 1,"unit":"A"},
                {"num":"114","name":"BattreySoc","address":"0100","type":"UInt16BE","rate":1,"format": 0,"unit":"%"},
                {"num":"115","name":"ChargeCurrentByLine","address":"021E","type":"Int16BE","rate":0.1,"format": 1,"unit":"A"},
                {"num":"116","name":"LoadVoltage","address":"0216","type":"UInt16BE","rate":0.1,"format": 1,"unit":"V"},
                {"num":"117","name":"LoadCurrent","address":"0219","type":"UInt16BE","rate":0.1,"format": 1,"unit":"A"},
                {"num":"118","name":"LoadActivePower","address":"021B","type":"UInt16BE","rate":1,"format": 0,"unit":"W"},
                {"num":"119","name":"LoadApparentPower","address":"021C","type":"UInt16BE","rate":1,"format": 0,"unit":"VA"},
                {"num":"120","name":"LoadRatio","address":"021F","type":"UInt16BE","rate":1,"format": 0,"unit":"%"},
                {"num":"121","name":"Temperature DC","address": "0220","type":"Int16BE","rate":0.1,"format": 1,"unit":"˚C"},
                {"num":"122","name":"Temperature AC","address": "0221","type":"Int16BE","rate":0.1,"format": 1,"unit":"˚C"},
                {"num":"123","name":"Temperature TR","address": "0222","type":"Int16BE","rate":0.1,"format": 1,"unit":"˚C"},
                {"num":"124","name":"InverterCurrent","address": "0217","type":"UInt16BE","rate":0.1,"format": 1,"unit":"A"},
                {"num":"125","name":"InverterFrequency","address": "0218","type":"UInt16BE","rate":0.01,"format": 2,"unit":"Hz"},
                {"num":"126","name":"BatteryChargeStep","address": "010B","type":"UInt16BE","rate":1,"format": 0,"unit":["Not start","Const current","Const voltage","reserved","Float charge","reserved","Active charge","Active charge"]}, 
                {"num":"127","name":"BusVoltage","address": "0212","type":"UInt16BE","rate":0.1,"format": 1,"unit":"V"},
                {"num":"128","name":"LoadPowerConsumptionOnTheDay","address": "F030","type":"UInt16BE","rate":0.1,"format": 1,"unit":"KWH"},
                {"num":"129","name":"LoadPowerConsumptionOnTheDayFromMains","address": "F03D","type":"UInt16BE","rate":0.1,"format": 1,"unit":"KWH"},
                {"num":"130","name":"PVCumulativePowerGeneration","address": "F038","type":"UInt16BE","rate":0.1,"format": 1,"unit":"KWH"},
                {"num":"131","name":"CumulativeCharge","address": "F046","type":"UInt16BE","rate":0.1,"format": 1,"unit":"AH"},
                {"num":"132","name":"AccumulatedBatteryChargeHours","address": "F034","type":"UInt16BE","rate":1,"format": 0,"unit":"AH"},
                {"num":"133","name":"AccumulatedBatteryDischargeTime","address": "F036","type":"UInt16BE","rate":1,"format": 0,"unit":"AH"},
                {"num":"134","name":"LoadCumulativePowerConsumption","address": "F03A","type":"UInt16BE","rate":0.1,"format": 1,"unit":"KWH"},
                {"num":"135","name":"AccumulatedLoadFromMainsConsumption","address": "F048","type":"UInt16BE","rate":0.1,"format": 1,"unit":"KWH"},
                {"num":"136","name":"PVPowerGenerationOnTheDay","address": "F02F","type":"UInt16BE","rate":0.1,"format": 1,"unit":"KWH"},
                {"num":"137","name":"BatteryChargeOnTheDay","address": "F02D","type":"UInt16BE","rate":1,"format": 0,"unit":"AH"},
                {"num":"138","name":"BatteryDischargeOnTheDay","address": "F02E","type":"UInt16BE","rate":1,"format": 0,"unit":"AH"}

            ];
let out="";
arr.forEach(function(el){
let val=el.name.replace(" ","_");
var template=`

  - platform: command_line
    name: ${val}
    unique_id: easun-isolar-smx-ii.${val}
    command: "cat /config/currentdata.json"
    json_attributes:
      - "${val}"
    value_template: "{{ value_json.${val} }}"
    scan_interval: 60`
    
    out+=template;

});