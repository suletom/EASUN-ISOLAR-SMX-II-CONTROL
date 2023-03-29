class etc{

    constructor() {

    }

    static unixTimestamp = function(d=null) {  
        let bd=Date.now();
        if (d!==null){
            bd=d;
        }
        return Math.floor(bd / 1000)
    }

}

module.exports=etc;