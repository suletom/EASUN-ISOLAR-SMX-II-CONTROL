let fs = require('fs');

const httpdash = function(req,configobj){

    let cdata=fs.readFileSync('commands.json',{encoding:'utf8', flag:'r'});
    let svg=fs.readFileSync('etc/display.svg',{encoding:'utf8', flag:'r'});

    let commands={};
    try{
        commands=JSON.parse(cdata);
    }catch(e){
        console.log(e);
    }
   


    function getconfval(attr){
        if (configobj[attr]!==undefined){
            return configobj[attr].replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }

        return "";
    }

    let idata = ""

    commands.commands.forEach(function(el){
        if (Array.isArray(el.definition)){
            el.definition.forEach(function(def){

                let inp=`<input type="text" class="form-control" id="param${def.name}">`;
                if (Array.isArray(def.unit)){

                    inp=`<select class="form-control" id="param${def.name}" data-id="${def.num}" onchange="setparamchange(this)">`;

                    def.unit.forEach(function(u,ind){
                        inp+=`<option value="${u}">${u}</option>`;
                    });
                    inp+=`</select>`;
                }

                idata+=`
                <div class="form-group">
                    <label for="param${def.name}">${def.num}. ${def.name}</label>
                    ${inp}
                </div>`;
            });
            
        }
    });
    
     let out=`<html>
        <head>
            <title>...</title>
            <script language="javascript" src="/static/js/bootstrap.min.js"></script>
            <link rel="stylesheet" href="/static/css/bootstrap.min.css" />
            <script>

            let timer=null;
           

            function saveconfig(obj){

                let f=document.querySelector('#settingsform');
                console.log(f);
                let fd=new FormData(f);
                console.log(fd);
                let o=Object.fromEntries(fd.entries());
                console.log(o);
                fetch('/saveconfig',{ body: JSON.stringify(o), method: 'POST',headers: {'Content-Type': 'application/json'}}).then(function(response) {
                    return response.json()
                }).then(function(responsejson) {
                    alert(responsejson.msg);
                });

            }

            function setparamchange(obj){

                if (confirm("Sure??")) {
                    setparam(obj.dataset.id,obj.value);
                }

            }

            function setparam(param,value){

                let o={"paramid": param, "value": value};

                fetch('/set',{ body: JSON.stringify(o), method: 'POST',headers: {'Content-Type': 'application/json'}}).then(function(response) {
                    return response.json()
                }).then(function(responsejson) {
                    alert(responsejson.msg);
                });
            }

            function monitor() {
                
                fetch('/query').then(function(response) {

                    return response.json()
                }).then(function(responsejson) {
                    
                    if (responsejson.rv === undefined ) {

                        for (const [key, value] of Object.entries(responsejson)) {
                            
                            let elem=document.querySelector('#param'+key);
                            if (elem !== null && elem !== undefined){
                                elem.value=(responsejson[key+"_text"]!==undefined?responsejson[key+"_text"]:value);
                            }    
                        };

                        if (responsejson.MachineState==4){
                            document.querySelectorAll('#bypass-arrow,#bypass-arrow-end').forEach(function(el) {el.classList.add('show')});
                        }

                        if (responsejson.MachineState==5){
                            document.querySelectorAll('#inverter,#load-arrow,#load-arrow-end').forEach(function(el) {el.classList.add('show')});
                        }
                        
                        if (responsejson.LineVoltage>0){
                                document.querySelectorAll('#mains').forEach(function(el) {el.classList.add('show')});
                        }

                        
                        if (responsejson.PVVoltage>=120){
                                document.querySelectorAll('#solar').forEach(function(el) {el.classList.add('show')});
                                document.querySelectorAll('#solar-arrow,#solar-arrow-end').forEach(function(el) {el.classList.add('show')});
                                document.querySelectorAll('#charger-arrow,#charger-arrow-end').forEach(function(el) {el.classList.add('show')});

                                /*document.querySelectorAll('#inverter-arrow,#inverter-arrow-end').forEach(function(el) {el.classList.add('show')});*/
                                
                        }


                        
                        if (responsejson.LoadActivePower>0){
                                document.querySelectorAll('#load').forEach(function(el) {el.classList.add('show')});
                        }
                        
                        if (responsejson.BatteryCurrent<=0){
                                document.querySelectorAll('#battery,#drain-arrow,#drain-arrow-end').forEach(function(el) {el.classList.add('show')});
                        }else{
                                document.querySelectorAll('#battery,#charger,#battery-arrow,#battery-arrow-end').forEach(function(el) {el.classList.add('show')});
                        }

                        timer=setTimeout(function(){ monitor(); },1000);
                    }    
                });

            }

            monitor();

            </script>
            <style>
            #display{
                display: inline-block;
                text-align:center;
                width: 100%;
            }
            
            #mains, #charger *,#inverter *,#solar *,#battery *,#load *,#mains * {
                fill: rgba(255,255,255,0.2) !important;
                stroke: rgba(255,255,255,0.2) !important;
            }
            
            #mains.show, #charger.show *,#inverter.show *,#solar.show *,#battery.show *,#load.show *,#mains.show * {
                fill: rgba(255,255,255,1) !important;
                stroke: rgba(255,255,255,1) !important;
            }
            
            #mains-arrow, #charger-arrow,#inverter-arrow,#solar-arrow,#battery-arrow,#load-arrow, #bypass-arrow, #drain-arrow {
            
                stroke: rgba(255,255,255,0.2) !important;
            }
            
            #mains-arrow.show, #charger-arrow.show,#inverter-arrow.show,#solar-arrow.show,#battery-arrow.show,#load-arrow.show, #bypass-arrow.show, #drain-arrow.show {
            
                stroke: rgba(255,255,255,1) !important;
            }
            
            
            #charger-arrow-end *,
            #inverter-arrow-end *,
            #load-arrow-end *,
            #solar-arrow-end *,
            #battery-arrow-end *,
            #drain-arrow-end *,
            #bypass-arrow-end *{
                stroke: rgba(255,255,255,0.2) !important;
                fill: rgba(255,255,255,0.2) !important;
            }
            
            #charger-arrow-end.show *,
            #inverter-arrow-end.show *,
            #load-arrow-end.show *,
            #solar-arrow-end.show *,
            #battery-arrow-end.show *,
            #drain-arrow-end.show *,
            #bypass-arrow-end.show *{
                stroke: rgba(255,255,255,1) !important;
                fill: rgba(255,255,255,1) !important;
            }
            
            </style>
        </head>
        <body>
        <div class="container">
            <!-- <button type="button" class="btn btn-success" onclick="togglemonitor(this)">Run monitor</button> -->
        </body>    
        <div class="container">
            <div class="d-flex justify-content-center">${svg}</div>

            <form>
                <fieldset>
                ${idata}    
                </fieldset>
            </form>    
            <form id="settingsform">
                <fieldset>
                    <legend>Settings</legend>
                    <div class="form-group">
                        <label for="password">Http authentication password (plain text)</label>
                        <input type="text" class="form-control" id="password" name="password" value="${getconfval("password")}">
                    </div>
                    <div class="form-group">
                        <label for="ipaddress">Datalogger ip address</label>
                        <input type="text" class="form-control" id="ipaddress" name="ipaddress" value="${getconfval("ipaddress")}" placeholder="192.168.1.129" minlength="7" maxlength="15" size="15" pattern="^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$">
                    </div>
                    <div class="form-group">
                        <label for="localipaddress">Local ip address(back route from the datalogger)</label>
                        <input type="text" class="form-control" id="localipaddress" name="localipaddress" value="${getconfval("localipaddress")}" placeholder="192.168.88.1" minlength="7" maxlength="15" size="15" pattern="^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$">
                    </div>
                    <div class="form-group">
                        <label for="email">Email address</label>
                        <input type="email" class="form-control" name="email" value="${getconfval("email")}" id="email" placeholder="name@example.com">
                    </div>
                    <button type="button" class="btn btn-primary" onclick="saveconfig(this)">Save/apply config!</button>
                </fieldset>
            </form>
        </div>    
        </body>
     <html>`

     return out;

}

exports.httpdash=httpdash;