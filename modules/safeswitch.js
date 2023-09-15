const helper = require("./helper.js");
const notifier = require("./notifier.js");

class safeswitch{

    constructor() {

        this.safe_change_time_sec=3600*4;
        this.stored_charge_time=0;
        this.stored_mode="";
        this.stored_charge="";
    }

    init(init_mode,init_charge){

        if (this.stored_mode=="") {
            this.stored_mode=init_mode;
            this.stored_charge=init_charge;
        }    

    }

    getstate(){
        if (this.stored_mode==""){
            return "Virtual state: not inited.";
        }
        return "Virtual state: "+this.stored_mode+", "+this.stored_charge;
    }    

    switch_mode(config,mode,charge){


        if (this.stored_mode=="" || this.stored_charge=="" ){
            //not initialized, not doing anything
            console.log("SWITCHER: Mode safe switcher not initialized, not changing mode.");
            return;
        }

        if (mode!=this.stored_mode || charge!=this.stored_charge){

            //UTI -> SBU: check time
            if (this.stored_mode=="UTI" && mode=="SBU") {

                if ( (this.stored_time+this.safe_change_time_sec)<helper.unixTimestamp()){

                    this._switch(config,mode,charge);

                }else{
                    console.log("SWITCHER: Preventing switch due to time.");
                }
            }

            if (this.stored_mode=="SBU" && mode=="UTI") {

                this._switch(config,mode,charge);

            }

            if (this.stored_mode=="UTI" && mode=="UTI" && (charge!=this.stored_charge)) {
                this._switch(config,mode,charge);
            }

        }

    }

    _switch(configobj,mode,charge){

        notifier.notifier(configobj,"SMX NOTICE "+configobj.ipaddress,
                                                    "Suggested output mode switch: "+this.stored_mode+" -> "+mode+"\n Charger priority: "+this.stored_charge+" -> "+charge);

        this.stored_mode=mode;
        this.stored_charge=charge;

        this.stored_charge_time=helper.unixTimestamp();

    }
    
}

module.exports=safeswitch;