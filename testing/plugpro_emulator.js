const dgram = require('dgram');
const net = require('net');

let clientCounter = 0; 

const udpServer = dgram.createSocket('udp4');

udpServer.on('listening', () => {
  console.log('UDP server listening on port 58899');
});

udpServer.on('message', (msg, rinfo) => {
  console.log(`UDP message from ${rinfo.address}:${rinfo.port} - ${msg}`);

  if (msg.toString().startsWith('set>server=')) {
    clientCounter++;

    const clientIp = msg.toString().split('=')[1].split(':')[0];
    const clientPort = msg.toString().split(':')[1].slice(0, -1);

    udpServer.send(`rsp>server=${clientCounter};`, rinfo.port, rinfo.address);

    const tcpClient = net.createConnection({
      host: clientIp,
      port: clientPort
    }, () => {
      console.log(`Connected to ${clientIp}:${clientPort}`);
    });
    
    tcpClient.on('error', (err) => {
      console.error(`Error connecting to ${clientIp}:${clientPort} - ${err.message}`);
      console.error(err.stack); 
    });

    tcpClient.on('data', (data) => {

        let hexData = [];

        for(let i = 0; i < data.length; i++) {
          
          // Convert to hex and pad to 2 characters
          let hexByte = data[i].toString(16).toUpperCase();
          hexByte = hexByte.padStart(2, '0');
          
          hexData.push(hexByte);
        }
      
        const spacedHex = hexData.join(' ');
      
        console.log(`TCP message from ${clientIp}:${clientPort} - ${spacedHex}`);

        tcpClient.write(data);

    });
  }  
});

udpServer.bind(58899);