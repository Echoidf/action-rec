import React, { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import { Button, Image } from "@nutui/nutui-react-taro";
import info from "../../assets/info.circle.png";
import { openBluetoothAdapter } from "../../utils/bluetooth";
import bluetooth from "../../bluetooth";
import Taro from "@tarojs/taro";

function Index() {
  useEffect(() => {
    try {
      const res = wx.getSystemInfoSync();
      bluetooth.platform = res.platform;
    } catch (e) {
      console.log(e);
    }
  },[]);

  function handleBleBtnCilck() {
    // connectBle();
  }

  async function connectBle() {
    openBluetoothAdapter();
  }

  const gotoBle = (
    <View className="flex items-center">
      <Image src={info} width="15" height="15"></Image>
      <Text className="mr-2">暂未连接蓝牙</Text>
      <Button type="info" size="small" onClick={handleBleBtnCilck}>
        连接蓝牙
      </Button>
    </View>
  );

  const ble = (
    <View>
      <Text>已连接蓝牙：{bluetooth.deviceId}</Text>
    </View>
  );

  function toActionPage() {
    Taro.navigateTo({
      url: "/pages/action/index",
    });
  }

  function toDataPage() {
    Taro.navigateTo({
      url: "/pages/data/index",
    });
  }

  return (
    <View className="h-screen flex flex-col items-center justify-between">
      <Text className="text-lg text-blue-400">动作识别小程序</Text>
      <View className="flex flex-col space-y-2">
        <Text className="mb-2">当前设备为：{bluetooth.platform}</Text>
        <View className="mb-2">
          <Button type="info" block onClick={toActionPage}>
            动作识别
          </Button>
        </View>
        <View>
          <Button type="info" block onClick={toDataPage}>
            采集数据
          </Button>
        </View>
        {/* {bluetooth.serviceId ? ble : gotoBle} */}
      </View>
      <View className="pb-10"></View>
    </View>
  );
}

export default Index;
