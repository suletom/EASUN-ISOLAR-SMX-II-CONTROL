
> easun-isolar-smx-ii-control@1.0.0 gen-ha-config
> node ha_template_generator/gen.js



  - platform: command_line
    name: OutputPriority
    unique_id: easun-isolar-smx-ii.OutputPriority
    command: "cat /config/currentdata.json"
    json_attributes:
      - "OutputPriority"
    value_template: "{{ value_json['OutputPriority'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: OutputFrequency
    unique_id: easun-isolar-smx-ii.OutputFrequency
    command: "cat /config/currentdata.json"
    json_attributes:
      - "OutputFrequency"
    value_template: "{{ value_json['OutputFrequency'] }}"
    unit_of_measurement: "Hz"
    scan_interval: 60

  - platform: command_line
    name: AcInputVoltageRange
    unique_id: easun-isolar-smx-ii.AcInputVoltageRange
    command: "cat /config/currentdata.json"
    json_attributes:
      - "AcInputVoltageRange"
    value_template: "{{ value_json['AcInputVoltageRange'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: TurnToMainsVoltage
    unique_id: easun-isolar-smx-ii.TurnToMainsVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "TurnToMainsVoltage"
    value_template: "{{ value_json['TurnToMainsVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: TurnToInverterVoltage
    unique_id: easun-isolar-smx-ii.TurnToInverterVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "TurnToInverterVoltage"
    value_template: "{{ value_json['TurnToInverterVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: ChargerSourcePriority
    unique_id: easun-isolar-smx-ii.ChargerSourcePriority
    command: "cat /config/currentdata.json"
    json_attributes:
      - "ChargerSourcePriority"
    value_template: "{{ value_json['ChargerSourcePriority'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: MaxChargerCurrent
    unique_id: easun-isolar-smx-ii.MaxChargerCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "MaxChargerCurrent"
    value_template: "{{ value_json['MaxChargerCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: BatteryType
    unique_id: easun-isolar-smx-ii.BatteryType
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryType"
    value_template: "{{ value_json['BatteryType'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: BatteryBoostChargeVoltage
    unique_id: easun-isolar-smx-ii.BatteryBoostChargeVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryBoostChargeVoltage"
    value_template: "{{ value_json['BatteryBoostChargeVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: BatteryBoostChargeTime
    unique_id: easun-isolar-smx-ii.BatteryBoostChargeTime
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryBoostChargeTime"
    value_template: "{{ value_json['BatteryBoostChargeTime'] }}"
    unit_of_measurement: "Sec"
    scan_interval: 60

  - platform: command_line
    name: BatteryFloatingChargeVoltage
    unique_id: easun-isolar-smx-ii.BatteryFloatingChargeVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryFloatingChargeVoltage"
    value_template: "{{ value_json['BatteryFloatingChargeVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: BatteryOverDischargeVoltage
    unique_id: easun-isolar-smx-ii.BatteryOverDischargeVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryOverDischargeVoltage"
    value_template: "{{ value_json['BatteryOverDischargeVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: BatteryOverDischargeDelayTime
    unique_id: easun-isolar-smx-ii.BatteryOverDischargeDelayTime
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryOverDischargeDelayTime"
    value_template: "{{ value_json['BatteryOverDischargeDelayTime'] }}"
    unit_of_measurement: "Sec"
    scan_interval: 60

  - platform: command_line
    name: BatteryUnderVoltageAlarm
    unique_id: easun-isolar-smx-ii.BatteryUnderVoltageAlarm
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryUnderVoltageAlarm"
    value_template: "{{ value_json['BatteryUnderVoltageAlarm'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: BatteryDischargeLimitVoltage
    unique_id: easun-isolar-smx-ii.BatteryDischargeLimitVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryDischargeLimitVoltage"
    value_template: "{{ value_json['BatteryDischargeLimitVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: BatteryEqualizationEnable
    unique_id: easun-isolar-smx-ii.BatteryEqualizationEnable
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryEqualizationEnable"
    value_template: "{{ value_json['BatteryEqualizationEnable'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: BatteryEqualizationVoltage
    unique_id: easun-isolar-smx-ii.BatteryEqualizationVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryEqualizationVoltage"
    value_template: "{{ value_json['BatteryEqualizationVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: BatteryEqualizedTime
    unique_id: easun-isolar-smx-ii.BatteryEqualizedTime
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryEqualizedTime"
    value_template: "{{ value_json['BatteryEqualizedTime'] }}"
    unit_of_measurement: "Min"
    scan_interval: 60

  - platform: command_line
    name: BatteryEqualizedTimeOut
    unique_id: easun-isolar-smx-ii.BatteryEqualizedTimeOut
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryEqualizedTimeOut"
    value_template: "{{ value_json['BatteryEqualizedTimeOut'] }}"
    unit_of_measurement: "Min"
    scan_interval: 60

  - platform: command_line
    name: BatteryEqualizationInterval
    unique_id: easun-isolar-smx-ii.BatteryEqualizationInterval
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryEqualizationInterval"
    value_template: "{{ value_json['BatteryEqualizationInterval'] }}"
    unit_of_measurement: "Day"
    scan_interval: 60

  - platform: command_line
    name: BatteryEqualizationImmediately
    unique_id: easun-isolar-smx-ii.BatteryEqualizationImmediately
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryEqualizationImmediately"
    value_template: "{{ value_json['BatteryEqualizationImmediately'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: PowerSavingMode
    unique_id: easun-isolar-smx-ii.PowerSavingMode
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PowerSavingMode"
    value_template: "{{ value_json['PowerSavingMode'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: RestartWhenOverLoad
    unique_id: easun-isolar-smx-ii.RestartWhenOverLoad
    command: "cat /config/currentdata.json"
    json_attributes:
      - "RestartWhenOverLoad"
    value_template: "{{ value_json['RestartWhenOverLoad'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: RestartWhenOverTemperature
    unique_id: easun-isolar-smx-ii.RestartWhenOverTemperature
    command: "cat /config/currentdata.json"
    json_attributes:
      - "RestartWhenOverTemperature"
    value_template: "{{ value_json['RestartWhenOverTemperature'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: AlarmEnable
    unique_id: easun-isolar-smx-ii.AlarmEnable
    command: "cat /config/currentdata.json"
    json_attributes:
      - "AlarmEnable"
    value_template: "{{ value_json['AlarmEnable'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: InputChangeAlarm
    unique_id: easun-isolar-smx-ii.InputChangeAlarm
    command: "cat /config/currentdata.json"
    json_attributes:
      - "InputChangeAlarm"
    value_template: "{{ value_json['InputChangeAlarm'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: BypassOutputWhenOverLoad
    unique_id: easun-isolar-smx-ii.BypassOutputWhenOverLoad
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BypassOutputWhenOverLoad"
    value_template: "{{ value_json['BypassOutputWhenOverLoad'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: MaxACChargerCurrent
    unique_id: easun-isolar-smx-ii.MaxACChargerCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "MaxACChargerCurrent"
    value_template: "{{ value_json['MaxACChargerCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: SplitPhase
    unique_id: easun-isolar-smx-ii.SplitPhase
    command: "cat /config/currentdata.json"
    json_attributes:
      - "SplitPhase"
    value_template: "{{ value_json['SplitPhase'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: RS485Address
    unique_id: easun-isolar-smx-ii.RS485Address
    command: "cat /config/currentdata.json"
    json_attributes:
      - "RS485Address"
    value_template: "{{ value_json['RS485Address'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: ParallelModeNotSupported?
    unique_id: easun-isolar-smx-ii.ParallelModeNotSupported?
    command: "cat /config/currentdata.json"
    json_attributes:
      - "ParallelModeNotSupported?"
    value_template: "{{ value_json['ParallelModeNotSupported?'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: BMSEnableNotSupported?
    unique_id: easun-isolar-smx-ii.BMSEnableNotSupported?
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BMSEnableNotSupported?"
    value_template: "{{ value_json['BMSEnableNotSupported?'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: BMSProtocolNotSupported?
    unique_id: easun-isolar-smx-ii.BMSProtocolNotSupported?
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BMSProtocolNotSupported?"
    value_template: "{{ value_json['BMSProtocolNotSupported?'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: Reserved
    unique_id: easun-isolar-smx-ii.Reserved
    command: "cat /config/currentdata.json"
    json_attributes:
      - "Reserved"
    value_template: "{{ value_json['Reserved'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: BatteryUndervoltageRecovery
    unique_id: easun-isolar-smx-ii.BatteryUndervoltageRecovery
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryUndervoltageRecovery"
    value_template: "{{ value_json['BatteryUndervoltageRecovery'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: MaxPVChargerCurrent
    unique_id: easun-isolar-smx-ii.MaxPVChargerCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "MaxPVChargerCurrent"
    value_template: "{{ value_json['MaxPVChargerCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: BatteryChargeRecovery
    unique_id: easun-isolar-smx-ii.BatteryChargeRecovery
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryChargeRecovery"
    value_template: "{{ value_json['BatteryChargeRecovery'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: OutputVoltageSet
    unique_id: easun-isolar-smx-ii.OutputVoltageSet
    command: "cat /config/currentdata.json"
    json_attributes:
      - "OutputVoltageSet"
    value_template: "{{ value_json['OutputVoltageSet'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: SystemDateTime
    unique_id: easun-isolar-smx-ii.SystemDateTime
    command: "cat /config/currentdata.json"
    json_attributes:
      - "SystemDateTime"
    value_template: "{{ value_json['SystemDateTime'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: InputPasswordNotSupported?
    unique_id: easun-isolar-smx-ii.InputPasswordNotSupported?
    command: "cat /config/currentdata.json"
    json_attributes:
      - "InputPasswordNotSupported?"
    value_template: "{{ value_json['InputPasswordNotSupported?'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: ChangePasswordNotSupported?
    unique_id: easun-isolar-smx-ii.ChangePasswordNotSupported?
    command: "cat /config/currentdata.json"
    json_attributes:
      - "ChangePasswordNotSupported?"
    value_template: "{{ value_json['ChangePasswordNotSupported?'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: CustomerID
    unique_id: easun-isolar-smx-ii.CustomerID
    command: "cat /config/currentdata.json"
    json_attributes:
      - "CustomerID"
    value_template: "{{ value_json['CustomerID'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: PowerRate
    unique_id: easun-isolar-smx-ii.PowerRate
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PowerRate"
    value_template: "{{ value_json['PowerRate'] }}"
    unit_of_measurement: "kW"
    scan_interval: 60

  - platform: command_line
    name: PVVoltageRate
    unique_id: easun-isolar-smx-ii.PVVoltageRate
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PVVoltageRate"
    value_template: "{{ value_json['PVVoltageRate'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: MaxChargeCurrentByPV
    unique_id: easun-isolar-smx-ii.MaxChargeCurrentByPV
    command: "cat /config/currentdata.json"
    json_attributes:
      - "MaxChargeCurrentByPV"
    value_template: "{{ value_json['MaxChargeCurrentByPV'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: FunctionEnable1NotSupported?
    unique_id: easun-isolar-smx-ii.FunctionEnable1NotSupported?
    command: "cat /config/currentdata.json"
    json_attributes:
      - "FunctionEnable1NotSupported?"
    value_template: "{{ value_json['FunctionEnable1NotSupported?'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: FunctionEnable2NotSupported?
    unique_id: easun-isolar-smx-ii.FunctionEnable2NotSupported?
    command: "cat /config/currentdata.json"
    json_attributes:
      - "FunctionEnable2NotSupported?"
    value_template: "{{ value_json['FunctionEnable2NotSupported?'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: MachinePowerState
    unique_id: easun-isolar-smx-ii.MachinePowerState
    command: "cat /config/currentdata.json"
    json_attributes:
      - "MachinePowerState"
    value_template: "{{ value_json['MachinePowerState'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: MachineReset
    unique_id: easun-isolar-smx-ii.MachineReset
    command: "cat /config/currentdata.json"
    json_attributes:
      - "MachineReset"
    value_template: "{{ value_json['MachineReset'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: ModelBatteryVoltage
    unique_id: easun-isolar-smx-ii.ModelBatteryVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "ModelBatteryVoltage"
    value_template: "{{ value_json['ModelBatteryVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: APPVersion
    unique_id: easun-isolar-smx-ii.APPVersion
    command: "cat /config/currentdata.json"
    json_attributes:
      - "APPVersion"
    value_template: "{{ value_json['APPVersion'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: BootloaderSWVersion
    unique_id: easun-isolar-smx-ii.BootloaderSWVersion
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BootloaderSWVersion"
    value_template: "{{ value_json['BootloaderSWVersion'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: CompileTime
    unique_id: easun-isolar-smx-ii.CompileTime
    command: "cat /config/currentdata.json"
    json_attributes:
      - "CompileTime"
    value_template: "{{ value_json['CompileTime'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: ProductSN
    unique_id: easun-isolar-smx-ii.ProductSN
    command: "cat /config/currentdata.json"
    json_attributes:
      - "ProductSN"
    value_template: "{{ value_json['ProductSN'] }}"
    unit_of_measurement: ""
    scan_interval: 60

  - platform: command_line
    name: MachineState
    unique_id: easun-isolar-smx-ii.MachineState
    command: "cat /config/currentdata.json"
    json_attributes:
      - "MachineState"
    value_template: "{{ value_json['MachineState'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: CurrentFault
    unique_id: easun-isolar-smx-ii.CurrentFault
    command: "cat /config/currentdata.json"
    json_attributes:
      - "CurrentFault"
    value_template: "{{ value_json['CurrentFault'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: PVVoltage
    unique_id: easun-isolar-smx-ii.PVVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PVVoltage"
    value_template: "{{ value_json['PVVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: PVCurrent
    unique_id: easun-isolar-smx-ii.PVCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PVCurrent"
    value_template: "{{ value_json['PVCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: PVPower
    unique_id: easun-isolar-smx-ii.PVPower
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PVPower"
    value_template: "{{ value_json['PVPower'] }}"
    unit_of_measurement: "W"
    scan_interval: 60

  - platform: command_line
    name: LineVoltage
    unique_id: easun-isolar-smx-ii.LineVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LineVoltage"
    value_template: "{{ value_json['LineVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: LineCurrent
    unique_id: easun-isolar-smx-ii.LineCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LineCurrent"
    value_template: "{{ value_json['LineCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: LineFrequency
    unique_id: easun-isolar-smx-ii.LineFrequency
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LineFrequency"
    value_template: "{{ value_json['LineFrequency'] }}"
    unit_of_measurement: "Hz"
    scan_interval: 60

  - platform: command_line
    name: BatteryVoltage
    unique_id: easun-isolar-smx-ii.BatteryVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryVoltage"
    value_template: "{{ value_json['BatteryVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: BatteryCurrent
    unique_id: easun-isolar-smx-ii.BatteryCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryCurrent"
    value_template: "{{ value_json['BatteryCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: BattreySoc
    unique_id: easun-isolar-smx-ii.BattreySoc
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BattreySoc"
    value_template: "{{ value_json['BattreySoc'] }}"
    unit_of_measurement: "%"
    scan_interval: 60

  - platform: command_line
    name: ChargeCurrentByLine
    unique_id: easun-isolar-smx-ii.ChargeCurrentByLine
    command: "cat /config/currentdata.json"
    json_attributes:
      - "ChargeCurrentByLine"
    value_template: "{{ value_json['ChargeCurrentByLine'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: LoadVoltage
    unique_id: easun-isolar-smx-ii.LoadVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadVoltage"
    value_template: "{{ value_json['LoadVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: LoadCurrent
    unique_id: easun-isolar-smx-ii.LoadCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadCurrent"
    value_template: "{{ value_json['LoadCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: LoadActivePower
    unique_id: easun-isolar-smx-ii.LoadActivePower
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadActivePower"
    value_template: "{{ value_json['LoadActivePower'] }}"
    unit_of_measurement: "W"
    scan_interval: 60

  - platform: command_line
    name: LoadApparentPower
    unique_id: easun-isolar-smx-ii.LoadApparentPower
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadApparentPower"
    value_template: "{{ value_json['LoadApparentPower'] }}"
    unit_of_measurement: "VA"
    scan_interval: 60

  - platform: command_line
    name: LoadRatio
    unique_id: easun-isolar-smx-ii.LoadRatio
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadRatio"
    value_template: "{{ value_json['LoadRatio'] }}"
    unit_of_measurement: "%"
    scan_interval: 60

  - platform: command_line
    name: TemperatureDC
    unique_id: easun-isolar-smx-ii.TemperatureDC
    command: "cat /config/currentdata.json"
    json_attributes:
      - "TemperatureDC"
    value_template: "{{ value_json['TemperatureDC'] }}"
    unit_of_measurement: "˚C"
    scan_interval: 60

  - platform: command_line
    name: TemperatureAC
    unique_id: easun-isolar-smx-ii.TemperatureAC
    command: "cat /config/currentdata.json"
    json_attributes:
      - "TemperatureAC"
    value_template: "{{ value_json['TemperatureAC'] }}"
    unit_of_measurement: "˚C"
    scan_interval: 60

  - platform: command_line
    name: TemperatureTR
    unique_id: easun-isolar-smx-ii.TemperatureTR
    command: "cat /config/currentdata.json"
    json_attributes:
      - "TemperatureTR"
    value_template: "{{ value_json['TemperatureTR'] }}"
    unit_of_measurement: "˚C"
    scan_interval: 60

  - platform: command_line
    name: InverterCurrent
    unique_id: easun-isolar-smx-ii.InverterCurrent
    command: "cat /config/currentdata.json"
    json_attributes:
      - "InverterCurrent"
    value_template: "{{ value_json['InverterCurrent'] }}"
    unit_of_measurement: "A"
    scan_interval: 60

  - platform: command_line
    name: InverterFrequency
    unique_id: easun-isolar-smx-ii.InverterFrequency
    command: "cat /config/currentdata.json"
    json_attributes:
      - "InverterFrequency"
    value_template: "{{ value_json['InverterFrequency'] }}"
    unit_of_measurement: "Hz"
    scan_interval: 60

  - platform: command_line
    name: BatteryChargeStep
    unique_id: easun-isolar-smx-ii.BatteryChargeStep
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryChargeStep"
    value_template: "{{ value_json['BatteryChargeStep'] }}"
    
    scan_interval: 60

  - platform: command_line
    name: BusVoltage
    unique_id: easun-isolar-smx-ii.BusVoltage
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BusVoltage"
    value_template: "{{ value_json['BusVoltage'] }}"
    unit_of_measurement: "V"
    scan_interval: 60

  - platform: command_line
    name: LoadPowerConsumptionOnTheDay
    unique_id: easun-isolar-smx-ii.LoadPowerConsumptionOnTheDay
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadPowerConsumptionOnTheDay"
    value_template: "{{ value_json['LoadPowerConsumptionOnTheDay'] }}"
    unit_of_measurement: "KWH"
    scan_interval: 60

  - platform: command_line
    name: LoadPowerConsumptionOnTheDayFromMains
    unique_id: easun-isolar-smx-ii.LoadPowerConsumptionOnTheDayFromMains
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadPowerConsumptionOnTheDayFromMains"
    value_template: "{{ value_json['LoadPowerConsumptionOnTheDayFromMains'] }}"
    unit_of_measurement: "KWH"
    scan_interval: 60

  - platform: command_line
    name: PVCumulativePowerGeneration
    unique_id: easun-isolar-smx-ii.PVCumulativePowerGeneration
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PVCumulativePowerGeneration"
    value_template: "{{ value_json['PVCumulativePowerGeneration'] }}"
    unit_of_measurement: "KWH"
    scan_interval: 60

  - platform: command_line
    name: CumulativeCharge
    unique_id: easun-isolar-smx-ii.CumulativeCharge
    command: "cat /config/currentdata.json"
    json_attributes:
      - "CumulativeCharge"
    value_template: "{{ value_json['CumulativeCharge'] }}"
    unit_of_measurement: "AH"
    scan_interval: 60

  - platform: command_line
    name: AccumulatedBatteryChargeHours
    unique_id: easun-isolar-smx-ii.AccumulatedBatteryChargeHours
    command: "cat /config/currentdata.json"
    json_attributes:
      - "AccumulatedBatteryChargeHours"
    value_template: "{{ value_json['AccumulatedBatteryChargeHours'] }}"
    unit_of_measurement: "AH"
    scan_interval: 60

  - platform: command_line
    name: AccumulatedBatteryDischargeTime
    unique_id: easun-isolar-smx-ii.AccumulatedBatteryDischargeTime
    command: "cat /config/currentdata.json"
    json_attributes:
      - "AccumulatedBatteryDischargeTime"
    value_template: "{{ value_json['AccumulatedBatteryDischargeTime'] }}"
    unit_of_measurement: "AH"
    scan_interval: 60

  - platform: command_line
    name: LoadCumulativePowerConsumption
    unique_id: easun-isolar-smx-ii.LoadCumulativePowerConsumption
    command: "cat /config/currentdata.json"
    json_attributes:
      - "LoadCumulativePowerConsumption"
    value_template: "{{ value_json['LoadCumulativePowerConsumption'] }}"
    unit_of_measurement: "KWH"
    scan_interval: 60

  - platform: command_line
    name: AccumulatedLoadFromMainsConsumption
    unique_id: easun-isolar-smx-ii.AccumulatedLoadFromMainsConsumption
    command: "cat /config/currentdata.json"
    json_attributes:
      - "AccumulatedLoadFromMainsConsumption"
    value_template: "{{ value_json['AccumulatedLoadFromMainsConsumption'] }}"
    unit_of_measurement: "KWH"
    scan_interval: 60

  - platform: command_line
    name: PVPowerGenerationOnTheDay
    unique_id: easun-isolar-smx-ii.PVPowerGenerationOnTheDay
    command: "cat /config/currentdata.json"
    json_attributes:
      - "PVPowerGenerationOnTheDay"
    value_template: "{{ value_json['PVPowerGenerationOnTheDay'] }}"
    unit_of_measurement: "KWH"
    scan_interval: 60

  - platform: command_line
    name: BatteryChargeOnTheDay
    unique_id: easun-isolar-smx-ii.BatteryChargeOnTheDay
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryChargeOnTheDay"
    value_template: "{{ value_json['BatteryChargeOnTheDay'] }}"
    unit_of_measurement: "AH"
    scan_interval: 60

  - platform: command_line
    name: BatteryDischargeOnTheDay
    unique_id: easun-isolar-smx-ii.BatteryDischargeOnTheDay
    command: "cat /config/currentdata.json"
    json_attributes:
      - "BatteryDischargeOnTheDay"
    value_template: "{{ value_json['BatteryDischargeOnTheDay'] }}"
    unit_of_measurement: "AH"
    scan_interval: 60
