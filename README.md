# EASUN-ISOLAR-SMX-II-CONTROL
Documentation collection about controlling an EASUN-ISOLAR-SMX-II chinese off-grid solar inverter

The device comes with a "Wifi Plug Pro" adapter. This seem to be a kind of MODBUS TCP adapter.
Installation process according to the manual is the following:
1. connect the adatpter to the inverter (rs485 port)
2. the device creates a wifi access point (ssid=device id) which we can connect (according to the manual the default password is: 12345678)

echo "set>server=192.168.1.2:8899;" | nc -4u -q1 192.168.1.129 58899
