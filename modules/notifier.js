const nodemailer = require("nodemailer");

const notifier = function(configobj,subject,msg,callback=null){

    function isempty(obj,key){
        if (obj!==undefined && obj[key] != undefined ){
            if (obj[key]!=""){
                return true;
            }
        }
        return false;
    }

    console.log("Sendig notify:",subject,msg);

    if (
        !isempty(configobj.email) &&
        !isempty(configobj.smtp) &&
        !isempty(configobj.smtpuser) &&
        !isempty(configobj.smtppass) &&
        !isempty(configobj.smtpauth)
    ) {

        console.log("Sending by smtp....");

        let port=configobj.smtpauth=="auto"?25:465;

        let to={
            host: configobj.smtp,
            port: port,
            secure: (configobj.smtpauth=="ssl"?true:false), // true for 465, false for other ports
            auth: {
                user: configobj.smtpuser, // generated ethereal user
                pass: configobj.smtppass, // generated ethereal password
            }
        };
        //console.log(to);

        let transporter = nodemailer.createTransport(to);
        
        let mo={
            from: configobj.smtpuser, // sender address
            to: configobj.email, // list of receivers
            subject: subject, // Subject line
            html: msg, // html body
        };
        //console.log(mo);

        let wv=transporter.sendMail(mo, (err, info) => {
            console.log("NODEMAILER ERROR: ",err);
            console.log("NODEMAILER INFO: ",info);
        });


    }



}

exports.notifier=notifier;