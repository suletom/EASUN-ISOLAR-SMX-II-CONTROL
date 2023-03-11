
var path = require('path');
const { exec } = require('child_process');
let fs = require('fs');

let dir=__dirname;
dir=path.resolve(__dirname, '..');

console.log("INSTALLING to use from: ",dir);

let bin="node "+dir+"/icmd.js";
let pathn=dir;

let u=process.getuid();

if (u!==0){
    console.log("ERROR: To install run as root user or provide sudo password !!!!!!!!!");
}

let tmp=`
[Unit]
Description=ICMD INVERTER MONITOR

[Service]
ExecStart=${bin}
Restart=always
User=nobody
Group=nogroup
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=${pathn}

[Install]
WantedBy=multi-user.target`;


//console.log(tmp);


try {
    fs.writeFileSync('icmd.service',tmp);
} catch (err) {
    console.error(err);
}

exec('sudo cp icmd.service /etc/systemd/system/', (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    } else {
     // the *entire* stdout and stderr (buffered)
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
    }
});


exec('sudo systemctl daemon-reload', (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    } else {
     // the *entire* stdout and stderr (buffered)
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
    }
});


exec('sudo systemctl enable icmd', (err, stdout, stderr) => {
if (err) {
    //some err occurred
    console.error(err)
} else {
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
}
});

exec('sudo systemctl start icmd', (err, stdout, stderr) => {
    if (err) {
        //some err occurred
        console.error(err)
    } else {
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    }
    });
    
    
