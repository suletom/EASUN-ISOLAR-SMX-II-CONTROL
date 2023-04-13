let fs = require('fs');

const httpdash = function(req,configobj,ui_schema){

    let cdata=fs.readFileSync('commands.json',{encoding:'utf8', flag:'r'});
    let svg=fs.readFileSync('etc/display.svg',{encoding:'utf8', flag:'r'});

    let firststart=0;
    if (typeof configobj["ipaddress"] == undefined){
        firststart=1;
    }

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

    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }

    let idata = ""

    commands.commands.forEach(function(el){
        if (Array.isArray(el.definition)){
            el.definition.forEach(function(def){

                let unit=(def.unit!==undefined && !Array.isArray(def.unit))?"("+def.unit+")":"";
                let inp=`<input type="text" class="form-control notset" id="param${def.name}" data-unit="${unit}">`;
                if (Array.isArray(def.unit)){

                    inp=`<select class="form-control notset" id="param${def.name}" data-id="${def.num}" data-unit="${unit}" onchange="setparamchange(this,event)">`;

                    def.unit.forEach(function(u,ind){
                        inp+=`<option value="${u}">${u}</option>`;
                    });
                    inp+=`</select>`;
                }

                
                idata+=`
                <div class="form-group">
                    <label for="param${def.name}">${def.num}. ${def.name} ${unit}</label>
                    ${inp}
                </div>`;
            });
            
        }
    });

    let client=makeid(32);
    
    let out=`<html>
        <head>
            <title>EASUN ISOLAR SMX II Control</title>
            <script language="javascript" src="/static/js/bootstrap.min.js"></script>
            <script language="javascript" src="/statice/jsoneditor.js"></script>
            <link rel="stylesheet" href="/static/css/bootstrap.min.css" />
            <script>

            var editor=null;

            window.onload = function() {
                editor = new JSONEditor(document.getElementById('editorholder'),{
                    theme: 'bootstrap5',
                    no_additional_properties: true,
                    schema: {
                        type: "object",
                        title: "CONFIGURATION",
                        properties: {
                            password: {
                                type: "string",
                                title: "Http authentication 'smx' user password (plain text)"
                            },
                            ipaddress: {
                                type: "string",
                                title: "Datalogger ip address"
                            },
                            localipaddress: {
                                type: "string",
                                title: "Local ip address(back route from the datalogger)"
                            },
                            email: {
                                type: "string",
                                title: "Email address (for notifications)"
                            },
                            smtp: {
                                type: "string",
                                title: "SMTP server"
                            },
                            smtpuser: {
                                type: "string",
                                title: "SMTP user"
                            },
                            smtppass: {
                                type: "string",
                                title: "SMTP pass (plain text)"
                            },
                            smtpauth: {
                                type: "string",
                                title: "Datalogger ip address",
                                enum: ["auto","ssl"],
                                default: "auto"
                            },
                            telegrambt: {
                                type: "string",
                                title: "Telegram bot token"
                            },
                            telegramcid: {
                                type: "string",
                                title: "Telegram conversation id"
                            },
                            actions: {
                                type: "array",
                                format: "table",
                                title: "Custom actions",
                                items: {
                                    title: "Action",
                                    anyOf:  ${JSON.stringify(ui_schema)}
                                },
                                default: [{"action_check_connection":"notify"}]
                            },
                        
                        }
                    }
                });

                editor.on('ready',() => {
                    
                    ${firststart?'startwiz();':' editor.setValue('+JSON.stringify(configobj)+');'}
                });

                

            };    

            let timer=null;
           
            function startwiz(){

                fetch('/detect').then(function(response) {
                    return response.json()
                }).then(function(responsejson) {
                    if (confirm("Found datalogger on ip: "+responsejson+"! Want to Use it?")){
                        
                        let all=editor.getValue();
                        all["ipaddress"]=responsejson;
                        editor.setValue(all);
                        //document.getElementById("root[ipaddress]").value=responsejson;
                        
                    }
                }).catch(error => {
                    console.log(error);
                });

            }

            function saveconfig(obj){
                
                const errors = editor.validate();

                if (errors.length) {
                    alert(JSON.stringify(errors));
                    return;
                }
            
                let o = editor.getValue();
                console.log(o);
                fetch('/saveconfig',{ body: JSON.stringify(o), method: 'POST',headers: {'Content-Type': 'application/json'}}).then(function(response) {
                    return response.json()
                }).then(function(responsejson) {
                    if (responsejson.rv==1){
                        let c=document.querySelector('#dash');
                        c.classList.remove('hide');
                    }
                    alert(responsejson.msg);
                }).catch(error => {
                    console.log(error);
                });

            }

            function setparamchange(obj,e){

                obj.classList.add('loading');
                setTimeout(function(){ setparam(obj.dataset.id,obj.value,obj); },1);

            }

            function setparam(param,value,obj){

                if (confirm("Sure?? ("+param+" -> "+value+")")) {

                    let o={"paramid": param, "value": value};

                    fetch('/set?client=${client}',{ body: JSON.stringify(o), method: 'POST',headers: {'Content-Type': 'application/json'}}).then(function(response) {
                        return response.json()
                    }).then(function(responsejson) {
                        alert(responsejson.msg);
                    }).catch(error => {
                        console.log(error);
                    });

                }else{
                    obj.classList.remove('loading');
                }

            }

            function sh(sel,show=1){
                
                if (show) {
                    document.querySelectorAll(sel).forEach(function(el) {el.classList.add('show')});
                    //document.querySelectorAll(sel).forEach(function(el) {el.classList.remove('hide')});
                }else{
                    //document.querySelectorAll(sel).forEach(function(el) {el.classList.add('hide')});
                    document.querySelectorAll(sel).forEach(function(el) {el.classList.remove('show')});
                }    
            }

            function monitor() {
                
                fetch('/query?client=${client}').then(function(response) {

                    return response.json()
                }).then(function(responsejson) {
                    
                    if (responsejson.rv === undefined ) {

                        for (const [key, jvalue] of Object.entries(responsejson)) {

                            if (key=='msg') {
                                alert(jvalue.join('; '));
                            }


                            if (key=='notif'){
                                let nots=""; 
                                jvalue.forEach(function(el){
                                    console.log(el.lastokdate);
                                    var vv="...."+el.lastokdate;
                                    nots+=\`<tr class="alert alert-warning">
                                            <td>\${el.errordate}</td>
                                            <td>\${el.error}</td>
                                            <td>\${JSON.stringify(el.info)}</td>
                                            <td>ERR: \${el.present} 
                                            \${el.lastpresentdate}
                                            <td>
                                            <td>OK: \${el.ok}
                                            \${vv}
                                            <td>
                                         </tr>\`;
                                });
                                let n=document.querySelector('#notifs');
                                n.innerHTML=nots;
                            }
                            
                            let elem=document.querySelector('#param'+key);
                            if (elem !== null && elem !== undefined){

                                if (elem.classList.contains('notset')) elem.classList.remove('notset');
                                
                                let oldvalue=elem.value;
                          
                                if (elem.classList.contains('loading') ){
                                    if (oldvalue!=jvalue){
                                        elem.classList.remove('loading');
                                    }
                                }else{
                                    let newval=(responsejson[key+"_text"]!==undefined?responsejson[key+"_text"]:jvalue);

                                    if (newval!=oldvalue) {
                                      
                                        elem.value=newval;
                                    }
                                }
                            }

                            if (key=="state"){
                                document.querySelector("body").classList.remove('connected');
                                document.querySelector("body").classList.remove('notconnected');
                                document.querySelector("body").classList.add(jvalue);
                                
                            }

                            let delem=document.querySelector('#delem'+key);
                            if (delem !== null && delem !== undefined){
                                let u=document.querySelector('#param'+key);
                                let bu="";
                                if (u!==undefined && u.dataset.unit!==undefined) {
                                    bu=u.dataset.unit;
                                }    
                                delem.innerHTML=(responsejson[key+"_text"]!==undefined?responsejson[key+"_text"]:jvalue)+" "+bu;
                            }

                            if (key=='CurrentFault'){
                                let errcar=jvalue.match(/0: OK/g);
                                if (errcar.length!=4){
                                    document.querySelector('#delemCurrentFault').classList.add("fault");
                                }else{
                                    document.querySelector('#delemCurrentFault').classList.remove("fault");
                                }
                            }    

                        };
                        
                        if (responsejson.MachineState==4){
                            sh('#bypass-arrow,#bypass-arrow-end',1);
                            sh('#inverter,#load-arrow,#load-arrow-end',0);
                          
                        }else{
                            sh('#bypass-arrow,#bypass-arrow-end',0);
                        }
                        if (responsejson.MachineState==5){
                            sh('#inverter,#load-arrow,#load-arrow-end',1);
                          
                        }
                        
                        if (responsejson.LineVoltage>0){
                            sh('#mains',1);
                       
                        }else{
                            sh('#mains',0);
                         
                        }
                        
                        if (responsejson.PVVoltage>119){
                            sh('#solar',1);
                            sh('#solar-arrow,#solar-arrow-end',1);
        
                        }else{
                            sh('#solar',0);
                            sh('#solar-arrow,#solar-arrow-end',0);
                            
                        }
                        if (responsejson.LineCurrent>0){
                            sh('#charger-arrow,#charger-arrow-end',1);
                         
                        }else{
                            sh('#charger-arrow,#charger-arrow-end',0);
                           
                        }
                        
                        if (responsejson.LoadActivePower>0){
                            sh('#load',1);
                         
                        }else{
                            sh('#load',0);
                       
                        }
                        
                        if (responsejson.BatteryCurrent!=undefined){

                            if (responsejson.BatteryCurrent>=0){
                                sh('#battery,#drain-arrow,#drain-arrow-end',1);
                                sh('#battery-arrow,#battery-arrow-end',0);
                            }else{
                                sh('#battery,#battery-arrow,#battery-arrow-end',1);
                                sh('#drain-arrow,#drain-arrow-end',0);
                            }
                        }

                        if (responsejson.LoadActivePower>0 && responsejson.MachineState!=4 && (responsejson.PVVoltage>=119 || responsejson.LineCurrent>0)){
                            sh('#inverter-arrow,#inverter-arrow-end',1);
                           
                        }else{
                            sh('#inverter-arrow,#inverter-arrow-end',0);
                          
                        }
                        if ( responsejson.LineCurrent>0 || responsejson.PVVoltage>119 ){
                            sh('#charger',1);
                        }else{
                            sh('#charger',0);
                          
                        }
                        
                        timer=setTimeout(function(){ monitor(); },1000);
                    }    
                }).catch(error => {
                    console.log(error);
                    timer=setTimeout(function(){ monitor(); },1000);
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
            
            .loading,.loading:focus {
                background-color: orange;
            }
            .notset {
                background-color: grey;
            }

            .hide{
                display: none;
            }

            .connected{
                background-color: #d2f8d2;
            }
            .notconnected{
                background-color: #ffb3b2;
            }

            .fault{
                background-color: red;
                color: white;
            }

            </style>
        </head>
        <body class="notconnected">
        
        <div class="container">
            <section id="dash" class="${firststart?' hide':''}">
                <div id class="d-flex justify-content-center">${svg}</div>
                <div class="d-flex justify-content-center">
                    <div class="card-body"><label>PVPower</label><div id="delemPVPower"></div></div>
                    <div class="card-body"><label>BatteryCurrent</label><div id="delemBatteryCurrent"></div></div>
                    <div class="card-body"><label>BatteryVoltage</label><div id="delemBatteryVoltage"></div></div>
                    <div class="card-body"><label>LineCurrent</label><div id="delemLineCurrent"></div></div>
                    <div class="card-body"><label>LoadApparentPower</label><div id="delemLoadApparentPower"></div></div>
                    <div class="card-body"><label>MachineState</label><div id="delemMachineState"></div></div>
                </div>
                <div id="faults" class="d-flex justify-content-center">
                    <div class="card-body"><label>CurrentFault</label><div id="delemCurrentFault"></div></div>
                </div>  
                <div id="notif-cont" class="d-flex justify-content-center">
                    <div class="card-body"><label>Notifications</label><table id="notifs" class="table"></table></div>
                </div>  
                <div class="d-flex justify-content-center">
                    <div class="card-body"><label>API url:</label><div id="apiurl"><a target="_blank" href="/query"><script>document.write(window.location.href+"query");</script></a></div></div>
                </div>
                <button class="btn" onclick="document.querySelector('#allparams').classList.contains('hide')?document.querySelector('#allparams').classList.remove('hide'):document.querySelector('#allparams').classList.add('hide')">
                Show/Hide all params         
                </button>
                <form id="allparams" class="hide">
                    <fieldset>
                    ${idata}    
                    </fieldset>
                </form>
            </section>
            <section id="settings">
                <form id="settingsform">
                    <div id="editorholder">

                    </div>
                    <button type="button" class="btn btn-primary" onclick="saveconfig(this)">Save/apply config!</button>
            </section>
        </div>    
        </body>
     <html>`

     return out;

}

exports.httpdash=httpdash;