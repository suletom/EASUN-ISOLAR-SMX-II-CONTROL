# EASUN-ISOLAR-SMX-II-CONTROL
Documentation collection about controlling an EASUN-ISOLAR-SMX-II chinese off-grid solar inverter

The device comes with a "Wifi Plug Pro" datalogger adapter. This seem to be a kind of MODBUS TCP adapter.

Installation process according to the manual is the following:
1. connect the adatpter to the inverter (rs485 port)
2. Install and open SmartESS app (Android/IOS)
3. the device creates a wifi access point (ssid=device id) which we should connect to (according to the manual the default password is: 12345678)
4. In SmartEss main screen Wifi configuration -> Network Setting.  (If we connected succefully to the datalogger in previous step, the apps uses the wifi gateway ip make connection)
5. The app here sends the following UDP data: set>server=PHONE_WIFI_IP:8899; (This instructs the datalogger device to connect to a TCP server created by the SmartEss app) The UDP reply should be: rsp>server=1;
6. After that if we fill the WIFI ap settings(SSID/Password) and save with "Setting" button these are sent is TCP packages through the previously initiated conenction.



The same process without the app using linux utilities:

1. connect to the datalogger AP, and obtain an ip address
2. Identify IP addresses
GET AP GateWAY IP: 
ip r | grep default
FIND your Local IP (at the same subnet)!
3. start a local TCP server:
ncat -vvv -o /tmp/out -l 8899 -c 'echo -n "00010001000aff01160b0a16102d012c" |  xxd -r -p' --keep-open
4. Instruct the device to use our local TCP server: 
echo "set>server=LOCAL_TCP_SERVER_IP:8899;" | nc -4u -q1 DATALOGGER_AP_GATEWAY_IP 58899

EXAMPLE: echo "set>server=192.168.1.2:8899;" | nc -4u -q1 192.168.1.129 58899

WORK in progress....
