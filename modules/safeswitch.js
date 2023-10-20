const helper = require("./helper.js");
const notifier = require("./notifier.js");

class safeswitch{

    constructor() {

        this.safe_change_time_sec=3600*4;
        this.stored_change_time=0;
        this.stored_mode="";
        this.stored_charge="";
        this.send_notif=1;
        this.allow_sync=false;    }

    init(init_mode,init_charge,notif=1){

        if (this.stored_mode=="") {
            this.stored_mode=init_mode;
            this.stored_charge=init_charge;
        }

        this.send_notif=notif;
    }

    /* true if state changed at the moment, but after returns false for some time to wait to sync inverter parameters back */
    need_sync(){

        //safety check, if inited
        if (this.stored_mode==""){
            return false;
        }

        let nowtime=helper.unixTimestamp();
        if (nowtime-this.stored_change_time<(5*60)) {
            if (this.allow_sync) {
                this.allow_sync=false;
                return true;
            }
            return false;
        }else{
            return true;
        }

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

    switch_mode(config,mode,charge,now=null){

        let nowtime=helper.unixTimestamp();
        if (now==null) {
            nowtime=helper.unixTimestamp();
        }else{
            nowtime=now;
        }

        console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" switch_mode called:",mode,charge);
        if (this.stored_mode=="" || this.stored_charge=="" ){
            //not initialized, not doing anything
            console.log("SWITCHER: Mode safe switcher not initialized, not changing mode.");
            return;
        }

        if (mode!=this.stored_mode || charge!=this.stored_charge){
            console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" change detected....");
            //UTI -> SBU: check time
            if (this.stored_mode=="UTI" && mode=="SBU") {

                console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" UTI -> SBU");
                if ( (this.stored_change_time+this.safe_change_time_sec)<nowtime){
                    console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" UTI -> SBU time ok!");
                    this._switch(config,mode,charge,nowtime);

                }else{
                    console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" Preventing switch due to time, switch after: "+helper.fdate(this.stored_change_time+this.safe_change_time_sec));
                }
            }

            if (this.stored_mode=="SBU" && mode=="UTI") {
                console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" SBU -> UTI");
                this._switch(config,mode,charge,nowtime);

            }

            if (this.stored_mode=="UTI" && mode=="UTI" && (charge!=this.stored_charge)) {
                console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" UTI -> UTI, changeing charge mode....");
                this._switch(config,mode,charge,nowtime);
            }

        }

    }

    _switch(configobj,mode,charge,nowtime){

        if (this.send_notif) {
            console.log("SWITCHER: "+(this.send_notif?"(live)":"(emulator)")+" sending notification");
            notifier.notifier(configobj,"SMX NOTICE "+configobj.ipaddress,
                                                    "Suggested output mode switch: "+this.stored_mode+" -> "+mode+"\n Charger priority: "+this.stored_charge+" -> "+charge);
        }

        this.stored_mode=mode;
        this.stored_charge=charge;

        this.stored_change_time=nowtime;

        this.allow_sync=true;
    }
    
}

module.exports=safeswitch;