class etc{

    
    static unixTimestamp = function(d=null) {  
        let bd=Date.now();
        if (d!==null){
            bd=d;
        }
        return Math.floor(bd / 1000);
    };

    static fdate = function(ts){

        var date0 = new Date(ts * 1000);
        let year=date0.getFullYear();
        let mon=date0.getMonth()+1;
        let day=date0.getDate();
        let hour=date0.getHours();
        let min=date0.getMinutes();
        let sec=date0.getSeconds();

        mon=mon.toString().padStart(2,"0");
        day=day.toString().padStart(2,"0");
        hour=hour.toString().padStart(2,"0");
        min=min.toString().padStart(2,"0");
        sec=sec.toString().padStart(2,"0");

        return year+"-"+mon+"-"+day+" "+hour+":"+min+":"+sec;

    };

    static fdateobj = function(ts=null){
        if (ts===null){
            ts=etc.unixTimestamp();
        }
        var date0 = new Date(ts * 1000);
        let year=date0.getFullYear();
        let mon=date0.getMonth()+1;
        let day=date0.getDate();
        let hour=date0.getHours();
        let min=date0.getMinutes();
        let sec=date0.getSeconds();

        mon=mon.toString().padStart(2,"0");
        day=day.toString().padStart(2,"0");
        hour=hour.toString().padStart(2,"0");
        min=min.toString().padStart(2,"0");
        sec=sec.toString().padStart(2,"0");
        
        return {"year":year,"mon":mon,"day":day,"hour":hour,"min":min,"sec":sec};
    }

}

module.exports=etc;