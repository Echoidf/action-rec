/**
 * 定义蓝牙相关的全局变量
 */

const ble = {
  platform: "",
  deviceId: "B0:33:66:55:A4:62", //蓝牙设备id
  serviceUUIDSamll: "", //蓝牙可用服务id
  serviceId: "", //蓝牙服务id全名,用作参数调用小程序api
  notifyCharacteristicId: "", //该服务的notify特征值
  writeCharacteristicId: "", //该服务的write特征值
};


export default ble