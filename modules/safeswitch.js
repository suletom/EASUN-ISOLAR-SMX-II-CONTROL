const helper = require("./helper.js");
const notifier = require("./notifier.js");

class safeswitch{

    constructor() {

        this.safe_change_time_sec=3600*4;
        this.stored_change_time=0;
        this.stored_mode="";
        this.stored_charge="";
        this.send_notif=1;
    }

    init(init_mode,init_charge,notif){

        if (this.stored_mode=="") {
            this.stored_mode=init_mode;
            this.stored_charge=init_charge;
        }

        this.send_notif=notif;
    }

    getmodes(){
        return {"stored_mode":this.stored_mode, "stored_charge":this.stored_charge}
    }

    getstate(){
        if (this.stored_mode==""){
            return "Virtual state: not inited.";
        }
        return "Virtual state: "+this.stored_mode+", "+this.stored_charge+" Next switch after: "+helper.fdate(this.stored_change_time+this.safe_change_time_sec);
    }    

    switch_mode(config,mode,charge){

        console.log("SWITCHER: switch_mode called:",mode,charge);
        if (this.stored_mode=="" || this.stored_charge=="" ){
            //not initialized, not doing anything
            console.log("SWITCHER: Mode safe switcher not initialized, not changing mode.");
            return;
        }

        if (mode!=this.stored_mode || charge!=this.stored_charge){
            console.log("SWITCHER: change detected....");
            //UTI -> SBU: check time
            if (this.stored_mode=="UTI" && mode=="SBU") {

                console.log("SWITCHER: UTI -> SBU");
                if ( (this.stored_change_time+this.safe_change_time_sec)<helper.unixTimestamp()){
                    console.log("SWITCHER: UTI -> SBU time ok!");
                    this._switch(config,mode,charge);

                }else{
                    console.log("SWITCHER: Preventing switch due to time.");
                }
            }

            if (this.stored_mode=="SBU" && mode=="UTI") {
                console.log("SWITCHER: SBU -> UTI");
                this._switch(config,mode,charge);

            }

            if (this.stored_mode=="UTI" && mode=="UTI" && (charge!=this.stored_charge)) {
                console.log("SWITCHER: UTI -> UTI, changeing charge mode....");
                this._switch(config,mode,charge);
            }

        }

    }

    _switch(configobj,mode,charge){

        if (this.send_notif) {
            notifier.notifier(configobj,"SMX NOTICE "+configobj.ipaddress,
                                                    "Suggested output mode switch: "+this.stored_mode+" -> "+mode+"\n Charger priority: "+this.stored_charge+" -> "+charge);
        }

        this.stored_mode=mode;
        this.stored_charge=charge;

        this.stored_change_time=helper.unixTimestamp();

    }
    
}

module.exports=safeswitch;