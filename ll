
> easun-isolar-smx-ii-control@1.0.0 start
> node icmd.js "get-smx-param" "192.168.1.129"

!!! 0. Please connect to the datalogger wifi access point or ensure the device is accessible on your network !!!
!!! On initial setup the datalogger ip address is the gateway (obtained by dhcp from the datalogger wifi AP) !!!
!!! Provide custom local ip if the machine that you are running this script from is available on a custom route not on the default one (vpn setup) !!!
Quick examples:
 Query all inverter parameters: npm start get-smx-param [datalogger ip address]
 Set output priority(parameter 1) to SOL: npm start set-smx-param [datalogger ip address] 1 SOL 

USAGE: COMMAND [options] [localip=192.168.89.255]

COMMANDS:
set-wifi [datalogger ip address] [ssid] [password] 
 (sets wifi datalogger network via wireless AP)

factory-reset-wifi [datalogger ip address] 
 (wifi datalogger factory reset)

restart-wifi [datalogger ip address] 
 (wifi datalogger reset)

query-modbus [datalogger ip address] [raw_modbus_packet_hex] 
 (query modbus register)

query-modbus-crc [datalogger ip address] [register address hex and length] 
 (query modbus register with comupted crc)

get-device-info [datalogger ip address] 
 (gets wifi datalogger device id and other info)

get-smx-param [datalogger ip address] 
 (Get ISolar SMX II 3.6 inverter param value)

set-smx-param [datalogger ip address] [parameter number] [new value] 
 (Set ISolar SMX II 3.6 inverter param value WARNING: this is dangerous and experimental!)



Running: get-smx-param
Starting from param:  0
Query group: 0
APPVersion 20 0014 len:  1
BootloaderSWVersion 21 0015 len:  1

Query group: 1
CompileTime 33 0021 len:  20

Query group: 2
ProductSN 53 0035 len:  20

Query group: 3
BattreySoc 256 0100 len:  1
BatteryVoltage 257 0101 len:  1
BatteryCurrent 258 0102 len:  1
PVVoltage 263 0107 len:  1
PVCurrent 264 0108 len:  1
PVPower 265 0109 len:  1
BatteryChargeStep 267 010b len:  1

Query group: 4
CurrentFault 516 0204 len:  4
SystemDateTime 524 020c len:  3
MachineState 528 0210 len:  1
BusVoltage 530 0212 len:  1
LineVoltage 531 0213 len:  1
LineCurrent 532 0214 len:  1
LineFrequency 533 0215 len:  1
LoadVoltage 534 0216 len:  1

Query group: 5
InverterCurrent 535 0217 len:  1
InverterFrequency 536 0218 len:  1
LoadCurrent 537 0219 len:  1
LoadActivePower 539 021b len:  1
LoadApparentPower 540 021c len:  1
ChargeCurrentByLine 542 021e len:  1
LoadRatio 543 021f len:  1
TemperatureDC 544 0220 len:  1
TemperatureAC 545 0221 len:  1
TemperatureTR 546 0222 len:  1

Query group: 6
MachinePowerState 57088 df00 len:  1
MachineReset 57089 df01 len:  1
BatteryEqualizationImmediately 57101 df0d len:  1

Query group: 7
MaxPVChargerCurrent 57345 e001 len:  1
ModelBatteryVoltage 57347 e003 len:  1
BatteryType 57348 e004 len:  1
BatteryEqualizationVoltage 57351 e007 len:  1
BatteryBoostChargeVoltage 57352 e008 len:  1
BatteryFloatingChargeVoltage 57353 e009 len:  1
BatteryChargeRecovery 57354 e00a len:  1
BatteryUndervoltageRecovery 57355 e00b len:  1
BatteryUnderVoltageAlarm 57356 e00c len:  1
BatteryOverDischargeVoltage 57357 e00d len:  1
BatteryDischargeLimitVoltage 57358 e00e len:  1
BatteryOverDischargeDelayTime 57360 e010 len:  1
BatteryEqualizedTime 57361 e011 len:  1
BatteryBoostChargeTime 57362 e012 len:  1
BatteryEqualizationInterval 57363 e013 len:  1

Query group: 8
TurnToMainsVoltage 57371 e01b len:  1
TurnToInverterVoltage 57378 e022 len:  1
BatteryEqualizedTimeOut 57379 e023 len:  1

Query group: 9
Reserved 57620 e114 len:  1
CustomerID 57623 e117 len:  1
PowerRate 57624 e118 len:  1
FunctionEnable1NotSupported? 57629 e11d len:  1
FunctionEnable2NotSupported? 57630 e11e len:  1
PVVoltageRate 57631 e11f len:  1
MaxChargeCurrentByPV 57632 e120 len:  1

Query group: 10
RS485Address 57856 e200 len:  1
ParallelModeNotSupported? 57857 e201 len:  1
ChangePasswordNotSupported? 57858 e202 len:  1
InputPasswordNotSupported? 57859 e203 len:  1
OutputPriority 57860 e204 len:  1
MaxACChargerCurrent 57861 e205 len:  1
BatteryEqualizationEnable 57862 e206 len:  1
OutputVoltageSet 57864 e208 len:  1
OutputFrequency 57865 e209 len:  1
MaxChargerCurrent 57866 e20a len:  1
AcInputVoltageRange 57867 e20b len:  1
PowerSavingMode 57868 e20c len:  1
RestartWhenOverLoad 57869 e20d len:  1
RestartWhenOverTemperature 57870 e20e len:  1
ChargerSourcePriority 57871 e20f len:  1
AlarmEnable 57872 e210 len:  1
InputChangeAlarm 57873 e211 len:  1
BypassOutputWhenOverLoad 57874 e212 len:  1

Query group: 11
SplitPhase 57876 e214 len:  1
BMSEnableNotSupported? 57877 e215 len:  1
BMSProtocolNotSupported? 57883 e21b len:  1

Query group: 12
BatteryChargeOnTheDay 61485 f02d len:  1
BatteryDischargeOnTheDay 61486 f02e len:  1
PVPowerGenerationOnTheDay 61487 f02f len:  1
LoadPowerConsumptionOnTheDay 61488 f030 len:  1
AccumulatedBatteryChargeHours 61492 f034 len:  1
AccumulatedBatteryDischargeTime 61494 f036 len:  1
PVCumulativePowerGeneration 61496 f038 len:  1
LoadCumulativePowerConsumption 61498 f03a len:  1
LoadPowerConsumptionOnTheDayFromMains 61501 f03d len:  1

Query group: 13
CumulativeCharge 61510 f046 len:  1
AccumulatedLoadFromMainsConsumption 61512 f048 len:  1

Using local ip to create TCP server: 192.168.1.100
starting TCP server(port: 8899) to recieve data....
Sending UDP packet(port: 58899) to inform datalogger device to connect the TCP server:
set>server=192.168.1.100:8899;
UDP server listening on 0.0.0.0:32858
192.168.1.129:58899 - rsp>server=1;
Got answer, closing UDP socket...
192.168.1.129:53456 connected on TCP

Command: get_smx_param
Querying param from: 100 => APPVersion

Request: 00 01 00 01 00 0a ff 04   ff 03 00 14 00 02 91 d1   

{
  num: '100',
  name: 'APPVersion',
  address: 20,
  type: 'UInt16BE',
  rate: 0.01,
  format: 2,
  unit: '',
  index: 50,
  typelen: 1
}
(Response info len: 4 Data type: UInt16BE CRC check: 8a31 8a31)

Getting from buffer:  UInt16BE 11
100 APPVersion:	 	 6.63 

Response:
00 01 00 01 00 0b ff 04   01 03 04 [42m0[0m[42m2[0m [42m9[0m[42m7[0m 00 c9 8a   
31 


-----------------
{
  num: '101',
  name: 'BootloaderSWVersion',
  address: 21,
  type: 'UInt16BE',
  rate: 0.01,
  format: 2,
  unit: '',
  index: 51,
  typelen: 1
}
(Response info len: 4 Data type: UInt16BE CRC check: 8a31 8a31)

Getting from buffer:  UInt16BE 13
101 BootloaderSWVersion:	 	 2.01 

Response:
00 01 00 01 00 0b ff 04   01 03 04 02 97 [42m0[0m[42m0[0m [42mc[0m[42m9[0m 8a   
31 


-----------------
New group request:  1

Command: get_smx_param
Querying param from: 102 => CompileTime

Request: 00 02 00 01 00 0a ff 04   ff 03 00 21 00 14 00 11   

{
  num: '102',
  name: 'CompileTime',
  address: 33,
  type: 20,
  unit: '',
  index: 52,
  typelen: 20
}
(Response info len: 40 Data type: 20 CRC check: 0111 0111)

Getting from buffer: string: 20  from  11  to  31
102 CompileTime:	 	 May  7 202 

Response:
00 02 00 01 00 2f ff 04   01 03 28 [42m0[0m[42m0[0m [42m4[0m[42md[0m [42m0[0m[42m0[0m [42m6[0m[42m1[0m [42m0[0m[42m0[0m   
[42m7[0m[42m9[0m [42m0[0m[42m0[0m [42m2[0m[42m0[0m [42m0[0m[42m0[0m [42m2[0m[42m0[0m [42m0[0m[42m0[0m [42m3[0m[42m7[0m [42m0[0m[42m0[0m   [42m2[0m[42m0[0m [42m0[0m[42m0[0m [42m3[0m[42m2[0m [42m0[0m[42m0[0m [42m3[0m[42m0[0m [42m0[0m[42m0[0m [42m3[0m[42m2[0m 00   
32 00 20 00 31 00 31 00   3a 00 31 00 38 00 3a 00   
35 00 36 01 11 


-----------------
New group request:  2

Command: get_smx_param
Querying param from: 103 => ProductSN

Request: 00 03 00 01 00 0a ff 04   ff 03 00 35 00 14 40 15   

{
  num: '103',
  name: 'ProductSN',
  address: 53,
  type: 20,
  unit: '',
  index: 53,
  typelen: 20
}
(Response info len: 40 Data type: 20 CRC check: 78cc 78cc)

Getting from buffer: string: 20  from  11  to  31
103 ProductSN:	 	 SR-2207080 

Response:
00 03 00 01 00 2f ff 04   01 03 28 [42m0[0m[42m0[0m [42m5[0m[42m3[0m [42m0[0m[42m0[0m [42m5[0m[42m2[0m [42m0[0m[42m0[0m   
[42m2[0m[42md[0m [42m0[0m[42m0[0m [42m3[0m[42m2[0m [42m0[0m[42m0[0m [42m3[0m[42m2[0m [42m0[0m[42m0[0m [42m3[0m[42m0[0m [42m0[0m[42m0[0m   [42m3[0m[42m7[0m [42m0[0m[42m0[0m [42m3[0m[42m0[0m [42m0[0m[42m0[0m [42m3[0m[42m8[0m [42m0[0m[42m0[0m [42m3[0m[42m0[0m 00   
31 00 32 00 30 00 2d 00   33 00 30 00 30 00 39 00   
31 00 37 78 cc 


-----------------
New group request:  3

Command: get_smx_param
Querying param from: 114 => BattreySoc

Request: 00 04 00 01 00 0a ff 04   ff 03 01 00 00 0c 51 ed   

{
  num: '114',
  name: 'BattreySoc',
  address: 256,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: '%',
  index: 64,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 02ae 02ae)

Getting from buffer:  UInt16BE 11
114 BattreySoc:	 	 27 %

Response:
00 04 00 01 00 1f ff 04   01 03 18 [42m0[0m[42m0[0m [42m1[0m[42mb[0m 01 07 00   
48 00 00 00 00 00 00 00   00 00 00 00 00 00 00 00   
00 00 01 02 ae 


-----------------
{
  num: '112',
  name: 'BatteryVoltage',
  address: 257,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'V',
  index: 62,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 02ae 02ae)

Getting from buffer:  UInt16BE 13
112 BatteryVoltage:	 	 26.3 V

Response:
00 04 00 01 00 1f ff 04   01 03 18 00 1b [42m0[0m[42m1[0m [42m0[0m[42m7[0m 00   
48 00 00 00 00 00 00 00   00 00 00 00 00 00 00 00   
00 00 01 02 ae 


-----------------
{
  num: '113',
  name: 'BatteryCurrent',
  address: 258,
  type: 'Int16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 63,
  typelen: 1
}
(Response info len: 24 Data type: Int16BE CRC check: 02ae 02ae)

Getting from buffer:  Int16BE 15
113 BatteryCurrent:	 	 7.2 A

Response:
00 04 00 01 00 1f ff 04   01 03 18 00 1b 01 07 [42m0[0m[42m0[0m   
[42m4[0m[42m8[0m 00 00 00 00 00 00 00   00 00 00 00 00 00 00 00   
00 00 01 02 ae 


-----------------
{
  num: '106',
  name: 'PVVoltage',
  address: 263,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'V',
  index: 56,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 02ae 02ae)

Getting from buffer:  UInt16BE 25
106 PVVoltage:	 	 0.0 V

Response:
00 04 00 01 00 1f ff 04   01 03 18 00 1b 01 07 00   
48 00 00 00 00 00 00 00   00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00 00 00 00 00   
00 00 01 02 ae 


-----------------
{
  num: '107',
  name: 'PVCurrent',
  address: 264,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 57,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 02ae 02ae)

Getting from buffer:  UInt16BE 27
107 PVCurrent:	 	 0.0 A

Response:
00 04 00 01 00 1f ff 04   01 03 18 00 1b 01 07 00   
48 00 00 00 00 00 00 00   00 00 00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00 00 00   
00 00 01 02 ae 


-----------------
{
  num: '108',
  name: 'PVPower',
  address: 265,
  type: 'UInt16BE',
  rate: 1,
  format: 1,
  unit: 'W',
  index: 58,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 02ae 02ae)

Getting from buffer:  UInt16BE 29
108 PVPower:	 	 0.0 W

Response:
00 04 00 01 00 1f ff 04   01 03 18 00 1b 01 07 00   
48 00 00 00 00 00 00 00   00 00 00 00 00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00   
00 00 01 02 ae 


-----------------
{
  num: '126',
  name: 'BatteryChargeStep',
  address: 267,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: [
    'Not start',
    'Const current',
    'Const voltage',
    'reserved',
    'Float charge',
    'reserved',
    'Active charge',
    'Active charge'
  ],
  index: 76,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 02ae 02ae)

Getting from buffer:  UInt16BE 33
126 BatteryChargeStep:	 	 1  => Const current

Response:
00 04 00 01 00 1f ff 04   01 03 18 00 1b 01 07 00   
48 00 00 00 00 00 00 00   00 00 00 00 00 00 00 00   
00 [42m0[0m[42m0[0m [42m0[0m[42m1[0m 02 ae 


-----------------
New group request:  4

Command: get_smx_param
Querying param from: 105 => CurrentFault

Request: 00 05 00 01 00 0a ff 04   ff 03 02 04 00 13 51 a0   

{
  num: '105',
  name: 'CurrentFault',
  address: 516,
  type: 4,
  format: 101,
  unit: [
    'OK',
    'Battery under voltage alarm',
    'Battery over current software',
    'Battery disconnect',
    'Battery under voltage(stop discharge)',
    'Battery over current hardware',
    'Charger over voltage',
    'Bus over voltage hardware',
    'Bus over voltage software',
    'Pv over voltage',
    'Pv over current software',
    'Pv over current hardware',
    'Line loss',
    'Bypass over load',
    'Inverter output over load',
    'Inverter output over current',
    '',
    'Inverter output short circuit',
    '',
    'PV DC-DC over temperature',
    'Inverter over temperature',
    'The fan is blocked or fails',
    'EEPROM error',
    'Machine type error',
    '',
    '',
    'Bypass relay short circiut',
    '',
    '',
    'Bus under voltage',
    'The battery capacity is lower than 10%',
    'The battery capacity is lower than 5%',
    'Low battery capacity shutdown',
    '',
    'CAN communication fault of parallel system',
    'The parallel ID is incorrect',
    'Parallel machine synchronous shutdown',
    'Parallel share current error',
    'The battery voltage difference in parallel mode is too large',
    'The mains input source in parallel mode is inconsistent',
    'Hardware synchronization signal in parallel mode is faulty',
    'The DC component of the inverter voltage is abnormal',
    'The parallel program version is inconsistent',
    'The parallel connection in parallel mode is faulty',
    'Incorrect serial number information',
    'The parallel mode is incorrectly set',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'The BMS communication is faulty ',
    'BMS minor fault ',
    'BMS under temperature',
    'BMS over temperature',
    'BMS over current',
    'BMS under voltage',
    'BMS over voltage'
  ],
  index: 55,
  typelen: 4
}
(Response info len: 38 Data type: 4 CRC check: f582 f582)

Getting from buffer: string: 4  from  11  to  15
105 CurrentFault:	 	 FAULT0: 0: OK FAULT1: 0: OK FAULT2: 0: OK FAULT3: 0: OK  

Response:
00 05 00 01 00 2d ff 04   01 03 26 [42m0[0m[42m0[0m [42m0[0m[42m0[0m [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00   
00 00 00 00 00 00 01 00   00 00 00 17 02 0a 15 2f   
0f 00 00 00 05 00 00 0e   ae 09 38 00 00 13 88 08   
fb f5 82 


-----------------
{
  num: '39',
  name: 'SystemDateTime',
  address: 524,
  type: 3,
  format: 100,
  unit: '',
  index: 38,
  typelen: 3
}
(Response info len: 38 Data type: 3 CRC check: f582 f582)

Getting from buffer: string: 3  from  27  to  30
39 SystemDateTime:	 	 2023-02-10 21:47:15 

Response:
00 05 00 01 00 2d ff 04   01 03 26 00 00 00 00 00   
00 00 00 00 00 00 01 00   00 00 00 [42m1[0m[42m7[0m [42m0[0m[42m2[0m [42m0[0m[42ma[0m 15 2f   
0f 00 00 00 05 00 00 0e   ae 09 38 00 00 13 88 08   
fb f5 82 


-----------------
{
  num: '104',
  name: 'MachineState',
  address: 528,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: [
    'Power on',
    'Stand by',
    'Initialization',
    'Soft start',
    'Running in line',
    'Running in inverter',
    'Invert to line',
    'Line to invert',
    'remain',
    'remain',
    'Shutdown',
    'Fault'
  ],
  index: 54,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: f582 f582)

Getting from buffer:  UInt16BE 35
104 MachineState:	 	 5  => Running in inverter

Response:
00 05 00 01 00 2d ff 04   01 03 26 00 00 00 00 00   
00 00 00 00 00 00 01 00   00 00 00 17 02 0a 15 2f   
0f 00 00 [42m0[0m[42m0[0m [42m0[0m[42m5[0m 00 00 0e   ae 09 38 00 00 13 88 08   
fb f5 82 


-----------------
{
  num: '127',
  name: 'BusVoltage',
  address: 530,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'V',
  index: 77,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: f582 f582)

Getting from buffer:  UInt16BE 39
127 BusVoltage:	 	 375.8 V

Response:
00 05 00 01 00 2d ff 04   01 03 26 00 00 00 00 00   
00 00 00 00 00 00 01 00   00 00 00 17 02 0a 15 2f   
0f 00 00 00 05 00 00 [42m0[0m[42me[0m   [42ma[0m[42me[0m 09 38 00 00 13 88 08   
fb f5 82 


-----------------
{
  num: '109',
  name: 'LineVoltage',
  address: 531,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'V',
  index: 59,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: f582 f582)

Getting from buffer:  UInt16BE 41
109 LineVoltage:	 	 236.0 V

Response:
00 05 00 01 00 2d ff 04   01 03 26 00 00 00 00 00   
00 00 00 00 00 00 01 00   00 00 00 17 02 0a 15 2f   
0f 00 00 00 05 00 00 0e   ae [42m0[0m[42m9[0m [42m3[0m[42m8[0m 00 00 13 88 08   
fb f5 82 


-----------------
{
  num: '110',
  name: 'LineCurrent',
  address: 532,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 60,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: f582 f582)

Getting from buffer:  UInt16BE 43
110 LineCurrent:	 	 0.0 A

Response:
00 05 00 01 00 2d ff 04   01 03 26 00 00 00 00 00   
00 00 00 00 00 00 01 00   00 00 00 17 02 0a 15 2f   
0f 00 00 00 05 00 00 0e   ae 09 38 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 13 88 08   
fb f5 82 


-----------------
{
  num: '111',
  name: 'LineFrequency',
  address: 533,
  type: 'UInt16BE',
  rate: 0.01,
  format: 2,
  unit: 'Hz',
  index: 61,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: f582 f582)

Getting from buffer:  UInt16BE 45
111 LineFrequency:	 	 50.00 Hz

Response:
00 05 00 01 00 2d ff 04   01 03 26 00 00 00 00 00   
00 00 00 00 00 00 01 00   00 00 00 17 02 0a 15 2f   
0f 00 00 00 05 00 00 0e   ae 09 38 00 00 [42m1[0m[42m3[0m [42m8[0m[42m8[0m 08   
fb f5 82 


-----------------
{
  num: '116',
  name: 'LoadVoltage',
  address: 534,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'V',
  index: 66,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: f582 f582)

Getting from buffer:  UInt16BE 47
116 LoadVoltage:	 	 229.9 V

Response:
00 05 00 01 00 2d ff 04   01 03 26 00 00 00 00 00   
00 00 00 00 00 00 01 00   00 00 00 17 02 0a 15 2f   
0f 00 00 00 05 00 00 0e   ae 09 38 00 00 13 88 [42m0[0m[42m8[0m   
[42mf[0m[42mb[0m f5 82 


-----------------
New group request:  5

Command: get_smx_param
Querying param from: 124 => InverterCurrent

Request: 00 06 00 01 00 0a ff 04   ff 03 02 17 00 0c e1 ad   

{
  num: '124',
  name: 'InverterCurrent',
  address: 535,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 74,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 297c 297c)

Getting from buffer:  UInt16BE 11
124 InverterCurrent:	 	 1.2 A

Response:
00 06 00 01 00 1f ff 04   01 03 18 [42m0[0m[42m0[0m [42m0[0m[42mc[0m 13 88 00   
09 00 00 00 d5 00 d5 00   00 00 00 00 05 00 f6 01   
1c 01 91 29 7c 


-----------------
{
  num: '125',
  name: 'InverterFrequency',
  address: 536,
  type: 'UInt16BE',
  rate: 0.01,
  format: 2,
  unit: 'Hz',
  index: 75,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 297c 297c)

Getting from buffer:  UInt16BE 13
125 InverterFrequency:	 	 50.00 Hz

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c [42m1[0m[42m3[0m [42m8[0m[42m8[0m 00   
09 00 00 00 d5 00 d5 00   00 00 00 00 05 00 f6 01   
1c 01 91 29 7c 


-----------------
{
  num: '117',
  name: 'LoadCurrent',
  address: 537,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 67,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 297c 297c)

Getting from buffer:  UInt16BE 15
117 LoadCurrent:	 	 0.9 A

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 [42m0[0m[42m0[0m   
[42m0[0m[42m9[0m 00 00 00 d5 00 d5 00   00 00 00 00 05 00 f6 01   
1c 01 91 29 7c 


-----------------
{
  num: '118',
  name: 'LoadActivePower',
  address: 539,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: 'W',
  index: 68,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 297c 297c)

Getting from buffer:  UInt16BE 19
118 LoadActivePower:	 	 213 W

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 00   
09 00 00 [42m0[0m[42m0[0m [42md[0m[42m5[0m 00 d5 00   00 00 00 00 05 00 f6 01   
1c 01 91 29 7c 


-----------------
{
  num: '119',
  name: 'LoadApparentPower',
  address: 540,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: 'VA',
  index: 69,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 297c 297c)

Getting from buffer:  UInt16BE 21
119 LoadApparentPower:	 	 213 VA

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 00   
09 00 00 00 d5 [42m0[0m[42m0[0m [42md[0m[42m5[0m 00   00 00 00 00 05 00 f6 01   
1c 01 91 29 7c 


-----------------
{
  num: '115',
  name: 'ChargeCurrentByLine',
  address: 542,
  type: 'Int16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 65,
  typelen: 1
}
(Response info len: 24 Data type: Int16BE CRC check: 297c 297c)

Getting from buffer:  Int16BE 25
115 ChargeCurrentByLine:	 	 0.0 A

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 00   
09 00 00 00 d5 00 d5 00   00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00 05 00 f6 01   
1c 01 91 29 7c 


-----------------
{
  num: '120',
  name: 'LoadRatio',
  address: 543,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: '%',
  index: 70,
  typelen: 1
}
(Response info len: 24 Data type: UInt16BE CRC check: 297c 297c)

Getting from buffer:  UInt16BE 27
120 LoadRatio:	 	 5 %

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 00   
09 00 00 00 d5 00 d5 00   00 00 00 [42m0[0m[42m0[0m [42m0[0m[42m5[0m 00 f6 01   
1c 01 91 29 7c 


-----------------
{
  num: '121',
  name: 'TemperatureDC',
  address: 544,
  type: 'Int16BE',
  rate: 0.1,
  format: 1,
  unit: '˚C',
  index: 71,
  typelen: 1
}
(Response info len: 24 Data type: Int16BE CRC check: 297c 297c)

Getting from buffer:  Int16BE 29
121 TemperatureDC:	 	 24.6 ˚C

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 00   
09 00 00 00 d5 00 d5 00   00 00 00 00 05 [42m0[0m[42m0[0m [42mf[0m[42m6[0m 01   
1c 01 91 29 7c 


-----------------
{
  num: '122',
  name: 'TemperatureAC',
  address: 545,
  type: 'Int16BE',
  rate: 0.1,
  format: 1,
  unit: '˚C',
  index: 72,
  typelen: 1
}
(Response info len: 24 Data type: Int16BE CRC check: 297c 297c)

Getting from buffer:  Int16BE 31
122 TemperatureAC:	 	 28.4 ˚C

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 00   
09 00 00 00 d5 00 d5 00   00 00 00 00 05 00 f6 [42m0[0m[42m1[0m   
[42m1[0m[42mc[0m 01 91 29 7c 


-----------------
{
  num: '123',
  name: 'TemperatureTR',
  address: 546,
  type: 'Int16BE',
  rate: 0.1,
  format: 1,
  unit: '˚C',
  index: 73,
  typelen: 1
}
(Response info len: 24 Data type: Int16BE CRC check: 297c 297c)

Getting from buffer:  Int16BE 33
123 TemperatureTR:	 	 40.1 ˚C

Response:
00 06 00 01 00 1f ff 04   01 03 18 00 0c 13 88 00   
09 00 00 00 d5 00 d5 00   00 00 00 00 05 00 f6 01   
1c [42m0[0m[42m1[0m [42m9[0m[42m1[0m 29 7c 


-----------------
New group request:  6

Command: get_smx_param
Querying param from: 50 => MachinePowerState

Request: 00 07 00 01 00 0a ff 04   ff 03 df 00 00 0e ea 04   

{
  num: '50',
  name: 'MachinePowerState',
  address: 57088,
  type: 'UInt16BE',
  unit: [ 'SHUTDOWN', 'BOOT' ],
  index: 47,
  typelen: 1
}
(Response info len: 28 Data type: UInt16BE CRC check: a227 a227)

Getting from buffer:  UInt16BE 11
50 MachinePowerState:	 	 1  => BOOT

Response:
00 07 00 01 00 23 ff 04   01 03 1c [42m0[0m[42m0[0m [42m0[0m[42m1[0m 00 00 00   
00 00 00 00 00 00 00 00   00 00 00 00 00 00 00 00   
00 00 00 00 00 00 00 a2   27 


-----------------
{
  num: '51',
  name: 'MachineReset',
  address: 57089,
  type: 'UInt16BE',
  unit: [ 'NORESET', 'RESET' ],
  index: 48,
  typelen: 1
}
(Response info len: 28 Data type: UInt16BE CRC check: a227 a227)

Getting from buffer:  UInt16BE 13
51 MachineReset:	 	 0  => NORESET

Response:
00 07 00 01 00 23 ff 04   01 03 1c 00 01 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00   
00 00 00 00 00 00 00 00   00 00 00 00 00 00 00 00   
00 00 00 00 00 00 00 a2   27 


-----------------
{
  num: '21',
  name: 'BatteryEqualizationImmediately',
  address: 57101,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 20,
  typelen: 1
}
(Response info len: 28 Data type: UInt16BE CRC check: a227 a227)

Getting from buffer:  UInt16BE 37
21 BatteryEqualizationImmediately:	 	 0  => DIS

Response:
00 07 00 01 00 23 ff 04   01 03 1c 00 01 00 00 00   
00 00 00 00 00 00 00 00   00 00 00 00 00 00 00 00   
00 00 00 00 00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m a2   27 


-----------------
New group request:  7

Command: get_smx_param
Querying param from: 36 => MaxPVChargerCurrent

Request: 00 08 00 01 00 0a ff 04   ff 03 e0 01 00 13 77 d9   

{
  num: '36',
  name: 'MaxPVChargerCurrent',
  address: 57345,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 35,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 11
36 MaxPVChargerCurrent:	 	 5.0 A

Response:
00 08 00 01 00 2d ff 04   01 03 26 [42m0[0m[42m0[0m [42m3[0m[42m2[0m 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '60',
  name: 'ModelBatteryVoltage',
  address: 57347,
  type: 'UInt16BE',
  unit: 'V',
  index: 49,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 15
60 ModelBatteryVoltage:	 	 24 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 [42m0[0m[42m0[0m   
[42m1[0m[42m8[0m 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '8',
  name: 'BatteryType',
  address: 57348,
  type: 'UInt16BE',
  unit: [ 'USE', 'SLd', 'FLd', 'GEL', 'LF07/LF08/LF09', 'NCA' ],
  index: 7,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 17
08 BatteryType:	 	 0  => USE

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '17',
  name: 'BatteryEqualizationVoltage',
  address: 57351,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 16,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 23
17 BatteryEqualizationVoltage:	 	 28.4 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 [42m0[0m[42m0[0m   [42m8[0m[42me[0m 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '9',
  name: 'BatteryBoostChargeVoltage',
  address: 57352,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 8,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 25
09 BatteryBoostChargeVoltage:	 	 29.2 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e [42m0[0m[42m0[0m [42m9[0m[42m2[0m 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '11',
  name: 'BatteryFloatingChargeVoltage',
  address: 57353,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 10,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 27
11 BatteryFloatingChargeVoltage:	 	 27.6 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 [42m0[0m[42m0[0m [42m8[0m[42ma[0m 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '37',
  name: 'BatteryChargeRecovery',
  address: 57354,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 36,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 29
37 BatteryChargeRecovery:	 	 27.0 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a [42m0[0m[42m0[0m [42m8[0m[42m7[0m 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '35',
  name: 'BatteryUndervoltageRecovery',
  address: 57355,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 34,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 31
35 BatteryUndervoltageRecovery:	 	 25.8 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 [42m0[0m[42m0[0m   
[42m8[0m[42m1[0m 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '14',
  name: 'BatteryUnderVoltageAlarm',
  address: 57356,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 13,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 33
14 BatteryUnderVoltageAlarm:	 	 25.2 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 [42m0[0m[42m0[0m [42m7[0m[42me[0m 00 7d 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '12',
  name: 'BatteryOverDischargeVoltage',
  address: 57357,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 11,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 35
12 BatteryOverDischargeVoltage:	 	 25.0 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e [42m0[0m[42m0[0m [42m7[0m[42md[0m 00 7c 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '15',
  name: 'BatteryDischargeLimitVoltage',
  address: 57358,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 14,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 37
15 BatteryDischargeLimitVoltage:	 	 24.8 V

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d [42m0[0m[42m0[0m [42m7[0m[42mc[0m 00   00 00 32 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '13',
  name: 'BatteryOverDischargeDelayTime',
  address: 57360,
  type: 'UInt16BE',
  format: 0,
  unit: 'Sec',
  index: 12,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 41
13 BatteryOverDischargeDelayTime:	 	 50 Sec

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 [42m0[0m[42m0[0m [42m3[0m[42m2[0m 00 78 00 78 00   
78 72 7b 


-----------------
{
  num: '18',
  name: 'BatteryEqualizedTime',
  address: 57361,
  type: 'UInt16BE',
  format: 0,
  unit: 'Min',
  index: 17,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 43
18 BatteryEqualizedTime:	 	 120 Min

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 [42m0[0m[42m0[0m [42m7[0m[42m8[0m 00 78 00   
78 72 7b 


-----------------
{
  num: '10',
  name: 'BatteryBoostChargeTime',
  address: 57362,
  type: 'UInt16BE',
  format: 0,
  unit: 'Sec',
  index: 9,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 45
10 BatteryBoostChargeTime:	 	 120 Sec

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 [42m0[0m[42m0[0m [42m7[0m[42m8[0m 00   
78 72 7b 


-----------------
{
  num: '20',
  name: 'BatteryEqualizationInterval',
  address: 57363,
  type: 'UInt16BE',
  format: 0,
  unit: 'Day',
  index: 19,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 727b 727b)

Getting from buffer:  UInt16BE 47
20 BatteryEqualizationInterval:	 	 120 Day

Response:
00 08 00 01 00 2d ff 04   01 03 26 00 32 00 64 00   
18 00 00 00 96 00 90 00   8e 00 92 00 8a 00 87 00   
81 00 7e 00 7d 00 7c 00   00 00 32 00 78 00 78 [42m0[0m[42m0[0m   
[42m7[0m[42m8[0m 72 7b 


-----------------
New group request:  8

Command: get_smx_param
Querying param from: 4 => TurnToMainsVoltage

Request: 00 09 00 01 00 0a ff 04   ff 03 e0 1b 00 09 d7 d5   

{
  num: '4',
  name: 'TurnToMainsVoltage',
  address: 57371,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 3,
  typelen: 1
}
(Response info len: 18 Data type: UInt16BE CRC check: f984 f984)

Getting from buffer:  UInt16BE 11
04 TurnToMainsVoltage:	 	 25.2 V

Response:
00 09 00 01 00 19 ff 04   01 03 12 [42m0[0m[42m0[0m [42m7[0m[42me[0m 00 00 00   
00 00 00 00 05 00 04 00   00 00 87 00 0a f9 84 


-----------------
{
  num: '5',
  name: 'TurnToInverterVoltage',
  address: 57378,
  type: 'UInt16BE',
  rate: 0.2,
  format: 1,
  unit: 'V',
  index: 4,
  typelen: 1
}
(Response info len: 18 Data type: UInt16BE CRC check: f984 f984)

Getting from buffer:  UInt16BE 25
05 TurnToInverterVoltage:	 	 27.0 V

Response:
00 09 00 01 00 19 ff 04   01 03 12 00 7e 00 00 00   
00 00 00 00 05 00 04 00   00 [42m0[0m[42m0[0m [42m8[0m[42m7[0m 00 0a f9 84 


-----------------
{
  num: '19',
  name: 'BatteryEqualizedTimeOut',
  address: 57379,
  type: 'UInt16BE',
  format: 0,
  unit: 'Min',
  index: 18,
  typelen: 1
}
(Response info len: 18 Data type: UInt16BE CRC check: f984 f984)

Getting from buffer:  UInt16BE 27
19 BatteryEqualizedTimeOut:	 	 10 Min

Response:
00 09 00 01 00 19 ff 04   01 03 12 00 7e 00 00 00   
00 00 00 00 05 00 04 00   00 00 87 [42m0[0m[42m0[0m [42m0[0m[42ma[0m f9 84 


-----------------
New group request:  9

Command: get_smx_param
Querying param from: 34 => Reserved

Request: 00 10 00 01 00 0a ff 04   ff 03 e1 14 00 0d e7 e9   

{
  num: '34',
  name: 'Reserved',
  address: 57620,
  type: 'UInt16BE',
  unit: '',
  index: 33,
  typelen: 1
}
(Response info len: 26 Data type: UInt16BE CRC check: ae91 ae91)

Getting from buffer:  UInt16BE 11
34 Reserved:	 	 10 

Response:
00 10 00 01 00 21 ff 04   01 03 1a [42m0[0m[42m0[0m [42m0[0m[42ma[0m 00 0a 00   
15 00 09 00 24 00 00 00   00 00 00 00 00 00 00 00   
00 01 f4 03 20 ae 91 


-----------------
{
  num: '42',
  name: 'CustomerID',
  address: 57623,
  type: 'UInt16BE',
  unit: '',
  index: 41,
  typelen: 1
}
(Response info len: 26 Data type: UInt16BE CRC check: ae91 ae91)

Getting from buffer:  UInt16BE 17
42 CustomerID:	 	 9 

Response:
00 10 00 01 00 21 ff 04   01 03 1a 00 0a 00 0a 00   
15 [42m0[0m[42m0[0m [42m0[0m[42m9[0m 00 24 00 00 00   00 00 00 00 00 00 00 00   
00 01 f4 03 20 ae 91 


-----------------
{
  num: '43',
  name: 'PowerRate',
  address: 57624,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'kW',
  index: 42,
  typelen: 1
}
(Response info len: 26 Data type: UInt16BE CRC check: ae91 ae91)

Getting from buffer:  UInt16BE 19
43 PowerRate:	 	 3.6 kW

Response:
00 10 00 01 00 21 ff 04   01 03 1a 00 0a 00 0a 00   
15 00 09 [42m0[0m[42m0[0m [42m2[0m[42m4[0m 00 00 00   00 00 00 00 00 00 00 00   
00 01 f4 03 20 ae 91 


-----------------
{
  num: '46',
  name: 'FunctionEnable1NotSupported?',
  address: 57629,
  type: 'UInt16BE',
  unit: '',
  index: 45,
  typelen: 1
}
(Response info len: 26 Data type: UInt16BE CRC check: ae91 ae91)

Getting from buffer:  UInt16BE 29
46 FunctionEnable1NotSupported?:	 	 0 

Response:
00 10 00 01 00 21 ff 04   01 03 1a 00 0a 00 0a 00   
15 00 09 00 24 00 00 00   00 00 00 00 00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00   
00 01 f4 03 20 ae 91 


-----------------
{
  num: '47',
  name: 'FunctionEnable2NotSupported?',
  address: 57630,
  type: 'UInt16BE',
  unit: '',
  index: 46,
  typelen: 1
}
(Response info len: 26 Data type: UInt16BE CRC check: ae91 ae91)

Getting from buffer:  UInt16BE 31
47 FunctionEnable2NotSupported?:	 	 0 

Response:
00 10 00 01 00 21 ff 04   01 03 1a 00 0a 00 0a 00   
15 00 09 00 24 00 00 00   00 00 00 00 00 00 00 [42m0[0m[42m0[0m   
[42m0[0m[42m0[0m 01 f4 03 20 ae 91 


-----------------
{
  num: '44',
  name: 'PVVoltageRate',
  address: 57631,
  type: 'UInt16BE',
  unit: 'V',
  index: 43,
  typelen: 1
}
(Response info len: 26 Data type: UInt16BE CRC check: ae91 ae91)

Getting from buffer:  UInt16BE 33
44 PVVoltageRate:	 	 500 V

Response:
00 10 00 01 00 21 ff 04   01 03 1a 00 0a 00 0a 00   
15 00 09 00 24 00 00 00   00 00 00 00 00 00 00 00   
00 [42m0[0m[42m1[0m [42mf[0m[42m4[0m 03 20 ae 91 


-----------------
{
  num: '45',
  name: 'MaxChargeCurrentByPV',
  address: 57632,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 44,
  typelen: 1
}
(Response info len: 26 Data type: UInt16BE CRC check: ae91 ae91)

Getting from buffer:  UInt16BE 35
45 MaxChargeCurrentByPV:	 	 80.0 A

Response:
00 10 00 01 00 21 ff 04   01 03 1a 00 0a 00 0a 00   
15 00 09 00 24 00 00 00   00 00 00 00 00 00 00 00   
00 01 f4 [42m0[0m[42m3[0m [42m2[0m[42m0[0m ae 91 


-----------------
New group request:  10

Command: get_smx_param
Querying param from: 30 => RS485Address

Request: 00 11 00 01 00 0a ff 04   ff 03 e2 00 00 13 27 a1   

{
  num: '30',
  name: 'RS485Address',
  address: 57856,
  type: 'UInt16BE',
  unit: '',
  index: 29,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 11
30 RS485Address:	 	 1 

Response:
00 11 00 01 00 2d ff 04   01 03 26 [42m0[0m[42m0[0m [42m0[0m[42m1[0m 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '31',
  name: 'ParallelModeNotSupported?',
  address: 57857,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 30,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 13
31 ParallelModeNotSupported?:	 	 96 

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 [42m0[0m[42m0[0m [42m6[0m[42m0[0m 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '41',
  name: 'ChangePasswordNotSupported?',
  address: 57858,
  type: 'UInt16BE',
  unit: '',
  index: 40,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 15
41 ChangePasswordNotSupported?:	 	 0 

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 [42m0[0m[42m0[0m   
[42m0[0m[42m0[0m 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '40',
  name: 'InputPasswordNotSupported?',
  address: 57859,
  type: 'UInt16BE',
  unit: '',
  index: 39,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 17
40 InputPasswordNotSupported?:	 	 0 

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '1',
  name: 'OutputPriority',
  address: 57860,
  type: 'UInt16BE',
  unit: [ 'SOL', 'UTI', 'SBU' ],
  index: 0,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 19
01 OutputPriority:	 	 2  => SBU

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 [42m0[0m[42m0[0m [42m0[0m[42m2[0m 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '28',
  name: 'MaxACChargerCurrent',
  address: 57861,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 27,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 21
28 MaxACChargerCurrent:	 	 50.0 A

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 [42m0[0m[42m1[0m [42mf[0m[42m4[0m 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '16',
  name: 'BatteryEqualizationEnable',
  address: 57862,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 15,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 23
16 BatteryEqualizationEnable:	 	 0  => DIS

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 [42m0[0m[42m0[0m   [42m0[0m[42m0[0m 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '38',
  name: 'OutputVoltageSet',
  address: 57864,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'V',
  index: 37,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 27
38 OutputVoltageSet:	 	 230.0 V

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 [42m0[0m[42m8[0m [42mf[0m[42mc[0m 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '2',
  name: 'OutputFrequency',
  address: 57865,
  type: 'UInt16BE',
  rate: 0.01,
  format: 1,
  unit: 'Hz',
  index: 1,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 29
02 OutputFrequency:	 	 50.0 Hz

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc [42m1[0m[42m3[0m [42m8[0m[42m8[0m 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '7',
  name: 'MaxChargerCurrent',
  address: 57866,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'A',
  index: 6,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 31
07 MaxChargerCurrent:	 	 65.0 A

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 [42m0[0m[42m2[0m   
[42m8[0m[42ma[0m 00 01 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '3',
  name: 'AcInputVoltageRange',
  address: 57867,
  type: 'UInt16BE',
  unit: [ 'APL', 'UPS' ],
  index: 2,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 33
03 AcInputVoltageRange:	 	 1  => UPS

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a [42m0[0m[42m0[0m [42m0[0m[42m1[0m 00 00 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '22',
  name: 'PowerSavingMode',
  address: 57868,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 21,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 35
22 PowerSavingMode:	 	 0  => DIS

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 00 01 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '23',
  name: 'RestartWhenOverLoad',
  address: 57869,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 22,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 37
23 RestartWhenOverLoad:	 	 1  => ENA

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 [42m0[0m[42m0[0m [42m0[0m[42m1[0m 00   01 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '24',
  name: 'RestartWhenOverTemperature',
  address: 57870,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 23,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 39
24 RestartWhenOverTemperature:	 	 1  => ENA

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 [42m0[0m[42m0[0m   [42m0[0m[42m1[0m 00 03 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '6',
  name: 'ChargerSourcePriority',
  address: 57871,
  type: 'UInt16BE',
  unit: [ 'CSO', 'CUB', 'SNU', 'OSO' ],
  index: 5,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 41
06 ChargerSourcePriority:	 	 3  => OSO

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 [42m0[0m[42m0[0m [42m0[0m[42m3[0m 00 01 00 01 00   
01 49 d4 


-----------------
{
  num: '25',
  name: 'AlarmEnable',
  address: 57872,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 24,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 43
25 AlarmEnable:	 	 1  => ENA

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 [42m0[0m[42m0[0m [42m0[0m[42m1[0m 00 01 00   
01 49 d4 


-----------------
{
  num: '26',
  name: 'InputChangeAlarm',
  address: 57873,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 25,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 45
26 InputChangeAlarm:	 	 1  => ENA

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 [42m0[0m[42m0[0m [42m0[0m[42m1[0m 00   
01 49 d4 


-----------------
{
  num: '27',
  name: 'BypassOutputWhenOverLoad',
  address: 57874,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 26,
  typelen: 1
}
(Response info len: 38 Data type: UInt16BE CRC check: 49d4 49d4)

Getting from buffer:  UInt16BE 47
27 BypassOutputWhenOverLoad:	 	 1  => ENA

Response:
00 11 00 01 00 2d ff 04   01 03 26 00 01 00 60 00   
00 00 00 00 02 01 f4 00   00 00 19 08 fc 13 88 02   
8a 00 01 00 00 00 01 00   01 00 03 00 01 00 01 [42m0[0m[42m0[0m   
[42m0[0m[42m1[0m 49 d4 


-----------------
New group request:  11

Command: get_smx_param
Querying param from: 29 => SplitPhase

Request: 00 12 00 01 00 0a ff 04   ff 03 e2 14 00 08 27 ae   

{
  num: '29',
  name: 'SplitPhase',
  address: 57876,
  type: 'UInt16BE',
  unit: [ 'DIS', 'ENA' ],
  index: 28,
  typelen: 1
}
(Response info len: 16 Data type: UInt16BE CRC check: c7bc c7bc)

Getting from buffer:  UInt16BE 11
29 SplitPhase:	 	 0  => DIS

Response:
00 12 00 01 00 17 ff 04   01 03 10 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 7f ff 00   
14 00 00 7f ff ff ff ff   ff 00 00 c7 bc 


-----------------
{
  num: '32',
  name: 'BMSEnableNotSupported?',
  address: 57877,
  type: 'UInt16BE',
  unit: [ 'DIS', '485 BMS', 'CAN BMS' ],
  index: 31,
  typelen: 1
}
(Response info len: 16 Data type: UInt16BE CRC check: c7bc c7bc)

Getting from buffer:  UInt16BE 13
32 BMSEnableNotSupported?:	 	 32767 

Response:
00 12 00 01 00 17 ff 04   01 03 10 00 00 [42m7[0m[42mf[0m [42mf[0m[42mf[0m 00   
14 00 00 7f ff ff ff ff   ff 00 00 c7 bc 


-----------------
{
  num: '33',
  name: 'BMSProtocolNotSupported?',
  address: 57883,
  type: 'UInt16BE',
  unit: [
    'Pace',      'Rata',
    'Allgrand',  'Oliter',
    'PCT',       'Sunwoda',
    'Dyness',    'WOW',
    'Pylontech', 'WS Technicals',
    'Uz Energy'
  ],
  index: 32,
  typelen: 1
}
(Response info len: 16 Data type: UInt16BE CRC check: c7bc c7bc)

Getting from buffer:  UInt16BE 25
33 BMSProtocolNotSupported?:	 	 0  => Pace

Response:
00 12 00 01 00 17 ff 04   01 03 10 00 00 7f ff 00   
14 00 00 7f ff ff ff ff   ff [42m0[0m[42m0[0m [42m0[0m[42m0[0m c7 bc 


-----------------
New group request:  12

Command: get_smx_param
Querying param from: 137 => BatteryChargeOnTheDay

Request: 00 13 00 01 00 0a ff 04   ff 03 f0 2d 00 11 33 11   

{
  num: '137',
  name: 'BatteryChargeOnTheDay',
  address: 61485,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: 'AH',
  index: 87,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 11
137 BatteryChargeOnTheDay:	 	 170 AH

Response:
00 13 00 01 00 29 ff 04   01 03 22 [42m0[0m[42m0[0m [42ma[0m[42ma[0m 00 6c 00   
3a 00 33 00 00 00 00 00   00 11 ce 00 00 04 8d 00   
00 02 df 00 00 0c f8 00   00 00 00 00 00 31 83 


-----------------
{
  num: '138',
  name: 'BatteryDischargeOnTheDay',
  address: 61486,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: 'AH',
  index: 88,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 13
138 BatteryDischargeOnTheDay:	 	 108 AH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa [42m0[0m[42m0[0m [42m6[0m[42mc[0m 00   
3a 00 33 00 00 00 00 00   00 11 ce 00 00 04 8d 00   
00 02 df 00 00 0c f8 00   00 00 00 00 00 31 83 


-----------------
{
  num: '136',
  name: 'PVPowerGenerationOnTheDay',
  address: 61487,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'KWH',
  index: 86,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 15
136 PVPowerGenerationOnTheDay:	 	 5.8 KWH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa 00 6c [42m0[0m[42m0[0m   
[42m3[0m[42ma[0m 00 33 00 00 00 00 00   00 11 ce 00 00 04 8d 00   
00 02 df 00 00 0c f8 00   00 00 00 00 00 31 83 


-----------------
{
  num: '128',
  name: 'LoadPowerConsumptionOnTheDay',
  address: 61488,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'KWH',
  index: 78,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 17
128 LoadPowerConsumptionOnTheDay:	 	 5.1 KWH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa 00 6c 00   
3a [42m0[0m[42m0[0m [42m3[0m[42m3[0m 00 00 00 00 00   00 11 ce 00 00 04 8d 00   
00 02 df 00 00 0c f8 00   00 00 00 00 00 31 83 


-----------------
{
  num: '132',
  name: 'AccumulatedBatteryChargeHours',
  address: 61492,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: 'AH',
  index: 82,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 25
132 AccumulatedBatteryChargeHours:	 	 4558 AH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa 00 6c 00   
3a 00 33 00 00 00 00 00   00 [42m1[0m[42m1[0m [42mc[0m[42me[0m 00 00 04 8d 00   
00 02 df 00 00 0c f8 00   00 00 00 00 00 31 83 


-----------------
{
  num: '133',
  name: 'AccumulatedBatteryDischargeTime',
  address: 61494,
  type: 'UInt16BE',
  rate: 1,
  format: 0,
  unit: 'AH',
  index: 83,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 29
133 AccumulatedBatteryDischargeTime:	 	 1165 AH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa 00 6c 00   
3a 00 33 00 00 00 00 00   00 11 ce 00 00 [42m0[0m[42m4[0m [42m8[0m[42md[0m 00   
00 02 df 00 00 0c f8 00   00 00 00 00 00 31 83 


-----------------
{
  num: '130',
  name: 'PVCumulativePowerGeneration',
  address: 61496,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'KWH',
  index: 80,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 33
130 PVCumulativePowerGeneration:	 	 73.5 KWH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa 00 6c 00   
3a 00 33 00 00 00 00 00   00 11 ce 00 00 04 8d 00   
00 [42m0[0m[42m2[0m [42md[0m[42mf[0m 00 00 0c f8 00   00 00 00 00 00 31 83 


-----------------
{
  num: '134',
  name: 'LoadCumulativePowerConsumption',
  address: 61498,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'KWH',
  index: 84,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 37
134 LoadCumulativePowerConsumption:	 	 332.0 KWH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa 00 6c 00   
3a 00 33 00 00 00 00 00   00 11 ce 00 00 04 8d 00   
00 02 df 00 00 [42m0[0m[42mc[0m [42mf[0m[42m8[0m 00   00 00 00 00 00 31 83 


-----------------
{
  num: '129',
  name: 'LoadPowerConsumptionOnTheDayFromMains',
  address: 61501,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'KWH',
  index: 79,
  typelen: 1
}
(Response info len: 34 Data type: UInt16BE CRC check: 3183 3183)

Getting from buffer:  UInt16BE 43
129 LoadPowerConsumptionOnTheDayFromMains:	 	 0.0 KWH

Response:
00 13 00 01 00 29 ff 04   01 03 22 00 aa 00 6c 00   
3a 00 33 00 00 00 00 00   00 11 ce 00 00 04 8d 00   
00 02 df 00 00 0c f8 00   00 00 00 [42m0[0m[42m0[0m [42m0[0m[42m0[0m 31 83 


-----------------
New group request:  13

Command: get_smx_param
Querying param from: 131 => CumulativeCharge

Request: 00 14 00 01 00 0a ff 04   ff 03 f0 46 00 03 c2 c0   

{
  num: '131',
  name: 'CumulativeCharge',
  address: 61510,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'AH',
  index: 81,
  typelen: 1
}
(Response info len: 6 Data type: UInt16BE CRC check: 8745 8745)

Getting from buffer:  UInt16BE 11
131 CumulativeCharge:	 	 183.2 AH

Response:
00 14 00 01 00 0d ff 04   01 03 06 [42m0[0m[42m7[0m [42m2[0m[42m8[0m 00 00 09   
3d 87 45 


-----------------
{
  num: '135',
  name: 'AccumulatedLoadFromMainsConsumption',
  address: 61512,
  type: 'UInt16BE',
  rate: 0.1,
  format: 1,
  unit: 'KWH',
  index: 85,
  typelen: 1
}
(Response info len: 6 Data type: UInt16BE CRC check: 8745 8745)

Getting from buffer:  UInt16BE 15
135 AccumulatedLoadFromMainsConsumption:	 	 236.5 KWH

Response:
00 14 00 01 00 0d ff 04   01 03 06 07 28 00 00 [42m0[0m[42m9[0m   
[42m3[0m[42md[0m 87 45 


-----------------
JSON output:
 {
  APPVersion: 6.63,
  BootloaderSWVersion: 2.01,
  CompileTime: 'May  7 202',
  ProductSN: 'SR-2207080',
  PVVoltage: 0,
  PVCurrent: 0,
  PVPower: 0,
  BatteryVoltage: 26.3,
  BatteryCurrent: 7.2,
  BattreySoc: 27,
  BatteryChargeStep: 1,
  BatteryChargeStep_text: 'Const current',
  SystemDateTime: '2023-02-10 21:47:15',
  MachineState: 5,
  MachineState_text: 'Running in inverter',
  CurrentFault: 'FAULT0: 0: OK FAULT1: 0: OK FAULT2: 0: OK FAULT3: 0: OK ',
  LineVoltage: 236,
  LineCurrent: 0,
  LineFrequency: 50,
  LoadVoltage: 229.9,
  BusVoltage: 375.8,
  ChargeCurrentByLine: 0,
  LoadCurrent: 0.9,
  LoadActivePower: 213,
  LoadApparentPower: 213,
  LoadRatio: 5,
  TemperatureDC: 24.6,
  TemperatureAC: 28.4,
  TemperatureTR: 40.1,
  InverterCurrent: 1.2,
  InverterFrequency: 50,
  BatteryEqualizationImmediately: 0,
  BatteryEqualizationImmediately_text: 'DIS',
  MachinePowerState: 1,
  MachinePowerState_text: 'BOOT',
  MachineReset: 0,
  MachineReset_text: 'NORESET',
  BatteryType: 0,
  BatteryType_text: 'USE',
  BatteryBoostChargeVoltage: 29.2,
  BatteryBoostChargeTime: 120,
  BatteryFloatingChargeVoltage: 27.6,
  BatteryOverDischargeVoltage: 25,
  BatteryOverDischargeDelayTime: 50,
  BatteryUnderVoltageAlarm: 25.2,
  BatteryDischargeLimitVoltage: 24.8,
  BatteryEqualizationVoltage: 28.4,
  BatteryEqualizedTime: 120,
  BatteryEqualizationInterval: 120,
  BatteryUndervoltageRecovery: 25.8,
  MaxPVChargerCurrent: 5,
  BatteryChargeRecovery: 27,
  ModelBatteryVoltage: 24,
  TurnToMainsVoltage: 25.2,
  TurnToInverterVoltage: 27,
  BatteryEqualizedTimeOut: 10,
  Reserved: 10,
  CustomerID: 9,
  PowerRate: 3.6,
  PVVoltageRate: 500,
  MaxChargeCurrentByPV: 80,
  'FunctionEnable1NotSupported?': 0,
  'FunctionEnable2NotSupported?': 0,
  OutputPriority: 2,
  OutputPriority_text: 'SBU',
  OutputFrequency: 50,
  AcInputVoltageRange: 1,
  AcInputVoltageRange_text: 'UPS',
  ChargerSourcePriority: 3,
  ChargerSourcePriority_text: 'OSO',
  MaxChargerCurrent: 65,
  BatteryEqualizationEnable: 0,
  BatteryEqualizationEnable_text: 'DIS',
  PowerSavingMode: 0,
  PowerSavingMode_text: 'DIS',
  RestartWhenOverLoad: 1,
  RestartWhenOverLoad_text: 'ENA',
  RestartWhenOverTemperature: 1,
  RestartWhenOverTemperature_text: 'ENA',
  AlarmEnable: 1,
  AlarmEnable_text: 'ENA',
  InputChangeAlarm: 1,
  InputChangeAlarm_text: 'ENA',
  BypassOutputWhenOverLoad: 1,
  BypassOutputWhenOverLoad_text: 'ENA',
  MaxACChargerCurrent: 50,
  RS485Address: 1,
  'ParallelModeNotSupported?': 96,
  OutputVoltageSet: 230,
  'InputPasswordNotSupported?': 0,
  'ChangePasswordNotSupported?': 0,
  SplitPhase: 0,
  SplitPhase_text: 'DIS',
  'BMSEnableNotSupported?': 32767,
  'BMSProtocolNotSupported?': 0,
  'BMSProtocolNotSupported?_text': 'Pace',
  LoadPowerConsumptionOnTheDay: 5.1,
  LoadPowerConsumptionOnTheDayFromMains: 0,
  PVCumulativePowerGeneration: 73.5,
  AccumulatedBatteryChargeHours: 4558,
  AccumulatedBatteryDischargeTime: 1165,
  LoadCumulativePowerConsumption: 332,
  PVPowerGenerationOnTheDay: 5.8,
  BatteryChargeOnTheDay: 170,
  BatteryDischargeOnTheDay: 108,
  CumulativeCharge: 183.2,
  AccumulatedLoadFromMainsConsumption: 236.5
}
DONE, exiting
