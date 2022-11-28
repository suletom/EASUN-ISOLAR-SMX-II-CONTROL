# EASUN-ISOLAR-SMX-II-CONTROL
Documentation collection about controlling an EASUN-ISOLAR-SMX-II chinese off-grid solar inverter.

!! Work in progress, use this at your own risk!!
My test device is an EASUN branded 3.6KW inverter with original firmware.

The seller/manufacturer refused to provide any further information about controlling/monitoring the device on wifi and the supplied PC software is limited and has some bugs. My goal is to have the ability to control the inverter by software without any external serial/etc. device. The supplied tool is primary a helper to reverse engineer the communication.

The inverter comes with a "Wifi Plug Pro" datalogger adapter. This seem to be a kind of MODBUS TCP adapter. They provided cloud service and monitoring app (SmartESS) for this device setup.

My observations about the provided original installation process are the following:

1. Connect the adatpter to the inverter (rj45 rs485 port)
2. Install and open SmartESS app (Android/IOS)
3. The device creates a wifi access point (ssid=device id) which we should connect to (according to the manual the default password is: 12345678)
4. In SmartEss main screen Wifi configuration -> Network Setting.  (If we connected succefully to the datalogger in previous step, the apps uses the wifi gateway ip make connection)
5. The app here sends the following UDP data: set>server=PHONE_WIFI_IP:8899; (This instructs the datalogger device to connect to a TCP server created by the SmartEss app) The UDP reply should be: rsp>server=1;
6. After that if we fill the WIFI AP settings(SSID/Password) and save with "Setting" button these are sent in TCP packages through the previously initiated connection.


# CLI utility install/test
(provided commands probably work on ubuntu 20.04+ but not tested)

1. install nodejs (with npm) and git
> apt install git nodejs
2. clone the repo
>git clone https://github.com/suletom/EASUN-ISOLAR-SMX-II-CONTROL.git
>cd EASUN-ISOLAR-SMX-II-CONTROL
3. install needed node modules: 
>npm install
4. run the utility
>npm start

To access the device first check you network connection. You can connect directly to the WIFI AP povided by the adapter or if the device has been already set up to connect to local wifi router in this case you can connect on the device lan ip. On your local router/firewall the obtanined ip address can be found.

```
                       xxxxxxxx        xx
                    xxxx      xxxxxxxxx x
                  xxx                   xxxxx
┌────────┐    ┌──►xx                        xx ◄─┐
│        │    │    xx          LAN         xxx   │
│Inverter│           xxxxx               xxx     │
│        │    ┌┐  ◄─┐    xx              x   ┌───┴┐
│        │ ┌──┴┴──┐ │     xx   xxxxxxxxxxxx  │    │
│        │ │ WIFI │ │      xxxx              │    │
│        │ │ PLUG │ │                        │ PC │
│        │ │ PRO  │ │           OR           │    │
└──────┬─┘ └┬─────┘ │                        └──┬─┘
       │    │       │                           │
       └────┘       └───────────────────────────┘
                      CONNECTED TO ACCESS POINT
```

The utility provides info about the available functions arguments. On my test setup i was able to factory reset the device and set wifi connection data. 
Example: 
>npm start factory-reset-wifi [datalogger ip address]

>npm start set-wifi [datalogger ip address] [ssid] [password]

By sniffing the network traffic i found some command (HEX: aaaa00010003001100) that requests an all in one information packet with all the information seen in the SmartESS app. I extracted lot of data from that, but not everything is obvoius for me.

Example to query all params one by one with crc check:
>npm start get-smx-param [datalogger ip address]

Some register addresses has connection by the ones sent on serial line but not all of them and i think this command is not a standard MODBUS TCP.
Example(same as above without parsing): 
>npm start query-modbus [datalogger ip address] aaaa00010003001100

These are modbus tcp commands: i suspect some commands are for the wifi plug pro(clean modbus tcp frame: 2byte transaction id, 2byte protocol id, 2byte 
length, data: 1byte unit id, 1byte funtion code, etc. ), others are handled by the gateway and sent to the modbus rtu device on serial line.

Modbus commands for the inverter: 2byte transaction id, 2byte protocol id, 2byte length, data: 1byte unit id, 1byte funtion code, (modbus rtu packet:  1byte unit id, 1byte funtion code(for the inverter), 2byte register address, 2byte register offset, 2byte crc( crc16/MODBUS: from the beginning of the modbus rtu packet))

This one reads the inverter output priority parameter:
>npm start query-modbus aaaa0001000aff04ff03e2040001e66d

Request:
aa aa 00 01 00 0a ff 04   ff 03 e2 04 00 01 e6 6d

aaaa(trid)  0001(prot.id)  000a(length) ff(unit id) 04(functcode) ff(unit id) 03(functcode) e204(register address(seen on pc software serial)) 0001(offset) e66d(CRC16/modbus)

Response should be:
aa aa 00 01 00 09 ff 04   01 03 02 00 01 79 84

aaaa(trid) 0001(prot.id)  0009(length) ff(unit id) 04(functcode) 01(unit id) 03(functcode) 02(length) 0001(data(here: 0001->line out source, 0000->PV, etc.)) 7984(CRC16/modbus)

If you are interested feel free to contact me.
