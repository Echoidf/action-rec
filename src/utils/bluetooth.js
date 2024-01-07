import ble from "../bluetooth";

//1.打开蓝牙适配器
export const openBluetoothAdapter = () => {
  wx.openBluetoothAdapter({
    success: (result) => {
      startBluetoothDevicesDiscovery();
    },
    fail: (err) => {
      if (err.errMsg === "openBluetoothAdapter:fail already opened") {
        startBluetoothDevicesDiscovery();
      } else {
        wx.showToast({
          title: "请打开蓝牙",
          icon: "none",
        });
      }
    },
  });
};

// 搜索设备
export const startBluetoothDevicesDiscovery = () => {
  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
    interval: 100,
    success: (result) => {
      getBluetoothDevices();
    },
    fail: (err) => {
      if (
        err.errMsg ===
        "startBluetoothDevicesDiscovery:fail already discovering devices"
      ) {
        getBluetoothDevices();
      } else {
        wx.showToast({
          title: "搜索设备失败",
          icon: "none",
        });
      }
    },
  });
};
/**
 * 4.获取蓝牙设备信息
 * wx.onBluetoothDeviceFound：监听寻找到新设备的事件 ，表示只要找到一个新的蓝牙设备就会调用一次该方法。
 * wx.getBluetoothDevices：获取在蓝牙模块生效期间所有已发现的蓝牙设备，包括已经和本机处于连接状态的设备
 */
export const getBluetoothDevices = () => {
  wx.getBluetoothDevices({
    success: (res) => {
      var task = setTimeout(() => {
        console.log(res);
        for (var i = 0; i < res.devices.length; i++) {
          if (res.devices[i].deviceId === ble.deviceId) {
            createBLEConnection(res.devices[i].deviceId);
            clearTimeout(task)
            return;
          }
        }
        // startBluetoothDevicesDiscovery()
      },1000)
    },
    fail: (err) => {
      console.log(err);
      wx.showToast({
        title: "未获取到设备信息",
        icon: "none",
      });
    },
  });
};
//5.连接设备
export const createBLEConnection = (deviceId) => {
  wx.createBLEConnection({
    deviceId,
    success: (res) => {
      console.log("蓝牙连接成功：", res);
      wx.showToast({
        title: "连接成功",
        icon: "fails",
        duration: 800,
      });
      stopBluetoothDevicesDiscovery();
      getBLEDeviceServices();
    },
    fail: (err) => {
      console.log("蓝牙连接失败：", err);
      wx.showToast({
        title: "未连接到蓝牙，可能是设备没通电",
        icon: "none",
      });
    },
  });
};
//6.停止扫描设备
export const stopBluetoothDevicesDiscovery = () => {
  wx.stopBluetoothDevicesDiscovery({
    success: (result) => {
      console.log("连接蓝牙成功之后关闭蓝牙搜索");
    },
  });
};
//7.获取连接设备的service服务
export const getBLEDeviceServices = (deviceId) => {
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      var model = res.services[0];
      ble.serviceId = model.uuid;
      getBLEDeviceCharacteristics(); //6.0
    },
    fail: (err) => {
      wx.showToast({
        title: "未能获取服务",
      });
    },
  });
};
//8.获取连接设备具有读写功能服务的所有特征值
export const getBLEDeviceCharacteristics = (deviceId, serviceId) => {
  wx.getBLEDeviceCharacteristics({
    deviceId: ble.deviceId,
    serviceId: ble.serviceId,
    success: (res) => {
      for (var i = 0; i < res.characteristics.length; i++) {
        //2个值
        var model = res.characteristics[i];
        if (model.properties.notify == true) {
          ble.notifyCharacteristicId = model.uuid; //监听的值
          notifyBLECharacteristicValueChange(model.uuid); //7.0
        }
        if (model.properties.write == true) {
          ble.writeCharacteristicId = model.uuid; //用来写入的值
        }
      }
    },
    fail: (err) => {
      // reject(err);
    },
  });
};
//9.启动蓝牙设备特征值变化
export const notifyBLECharacteristicValueChange = (notifyCharacteristicId) => {
  wx.notifyBLECharacteristicValueChange({
    deviceId: ble.deviceId,
    serviceId: ble.serviceId,
    characteristicId: notifyCharacteristicId,
    state: true,
    success: (result) => {
      onBLECharacteristicValueChange();
    },
    fail: (err) => {
      reject(err);
    },
  });
};
//10.接受蓝牙发送的数据
export const onBLECharacteristicValueChange = () => {
  wx.onBLECharacteristicValueChange({
    success: (res) => {
      // 此时可以拿到蓝牙设备返回来的数据是一个ArrayBuffer类型数据，所以需要通过一个方法转换成字符串
      var nonceId = ab2hex(res.value);
      //TODO 拿到这个值后，肯定要去后台请求服务
      console.log("nonceId-->", nonceId);
    },
    fail: (err) => {
      reject(err);
    },
  });
};
//11.向蓝牙写入数据
export const writeBLECharacteristicValue = (
  deviceId,
  serviceId,
  writeCharacteristicId,
  value
) => {
  wx.writeBLECharacteristicValue({
    deviceId: deviceId,
    serviceId: serviceId,
    characteristicId: writeCharacteristicId,
    value: value,
    success: (result) => {
      wx.showToast({
        title: "已成功发送数据,蓝牙已打开",
      });
      resolve(result);
    },
    fail: (err) => {
      reject(err);
    },
  });
};
//12.关闭蓝牙
export const closeBluetoothAdapter = () => {
  wx.closeBluetoothAdapter({
    success: (result) => {
      resolve(result);
    },
    fail: (err) => {
      wx.showToast({
        title: "数据发送成功，但未关闭蓝牙，请手动关闭",
        icon: "none",
      });
      reject(err);
    },
  });
};

//byte转字符串
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint16Array(buffer),
    function (bit) {
      return "00" + bit.toString(16).slice(-2);
    }
  );
  return hexArr.join("");
}
// 字符串转byte
function stringToBytes(str) {
  var array = new Uint8Array(str.length);
  for (var i = 0, l = str.length; i < l; i++) {
    array[i] = str.charCodeAt(i);
  }
  console.log(array);
  return array.buffer;
}
