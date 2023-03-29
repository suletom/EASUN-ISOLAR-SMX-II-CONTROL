

class paramstorage { 

    constructor() {
        this.currentdata={};
        this.history=[];
    }

    store(jsobject,completedata=0){


        
                                                
        monitor_current_object={...monitor_current_object,...stateobject.outobj};
        
        try {
            fs.writeFileSync(current_data_store,JSON.stringify(monitor_current_object));
        } catch (err) {
            console.error(err)
        }

        if (completedata){
            console.log("Wiriting data to json file...");
        }



    }

    run(configobj,currentdata,watch){

        this.param_missing=false;

        let thisobj=this;

        for(let i=0;i<watch.length;i++){
            let w=watch[i];
            if (typeof thisobj[w.cond] === 'function'){
                if (w.add!=undefined) {
                    thisobj[w.cond](currentdata,w.add);
                }else{
                    thisobj[w.cond](currentdata,w.add);
                }
            }
        };

        if (this.errors.length==0){
            console.log("-------->>>> WATCHDOG: ALL GOOD! :) --------");
        }else{
            console.log("-------->>>> WATCHDOG:");

            let started=notifier.notifier(configobj,"SOLAR ALERT "+configobj.ipaddress,JSON.stringify(this.errors));
            console.log(this.errors);

            if (started) {
                this.errors=[];
            }

        }    
        
    }


}

module.exports=paramstorage;