import { View, Text } from "@tarojs/components";
import ActionCard from "../../components/action-card";
import { useState } from "react";
import { actions } from "../../consts/actions";
import { Button } from "@nutui/nutui-react-taro";
import { useEffect } from "react";
import { requestActionRec } from "../../api";
import ble from "../../bluetooth";

function Action() {
  const [timeVal, setTimeVal] = useState(0);
  const [action, setAction] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [timeInterval, setTimeInterval] = useState(null);

  useEffect(() => {
    wx.startAccelerometer({
      interval: ble.platform === "ios" ? "game" : "ui",
      success: (res) => {
        console.log("开始监听加速度数据");
      },
      fail: (res) => {
        console.log(res);
      },
    });
    wx.startGyroscope({
      interval: ble.platform === "ios" ? "game" : "ui",
      success: (res) => {
        console.log("开始监听陀螺仪数据");
      },
      fail: (res) => {
        console.log(res);
      },
    });
    return () => {
      stopAction();
    };
  }, []);

  const actionMap = {
    1: "徒手侧平举",
    2: "前后交叉小跑",
    3: "开合跳",
    4: "深蹲",
    5: "站立",
  };

  function startAction(e) {
    setIsReading(true);
    let accXs = [];
    let accYs = [];
    let accZs = [];
    let rgXs = [];
    let rgYs = [];
    let rgZs = [];

    const startTime = new Date().getTime();
    wx.onAccelerometerChange(function (res) {
      accXs.push(res.x);
      accYs.push(res.y);
      accZs.push(res.z);
    });
    wx.onGyroscopeChange(function (res) {
      rgXs.push(res.x);
      rgYs.push(res.y);
      rgZs.push(res.z);
    });
    setTimeInterval(
      setInterval(async () => {
        let midTime = new Date().getTime();
        let timeStep = (midTime - startTime) / 1000;
        setTimeVal(parseInt(timeStep));
        if (timeStep < 60.5) {
          const res = await requestActionRec({
            accx: accXs,
            accy: accYs,
            accz: accZs,
            gryx: rgXs,
            gryy: rgYs,
            gryz: rgZs,
            system: ble.platform === "ios" ? 1 : 2,
          });
          setAction(actionMap[res.data]);
        } else {
          wx.offAccelerometerChange();
          wx.offGyroscopeChange();
          stopAction();
        }
      }, 1200)
    );
  }

  function stopAction(index) {
    setIsReading(false);
    clearInterval(timeInterval);
    wx.stopAccelerometer({
      success: (res) => {
        console.log("停止读取Accelerometer");
        setAccelerometerX(0);
        setAccelerometerY(0);
        setAccelerometerZ(0);
      },
    });
    wx.stopGyroscope({
      success: (res) => {
        console.log("停止读取Gyroscope");
        setGyroscopeX(0);
        setGyroscopeY(0);
        setGyroscopeZ(0);
      },
    });
  }

  const actionItems = actions.map((item) => (
    <ActionCard imgSrc={item.img} title={item.title}></ActionCard>
  ));

  return (
    <View className="flex flex-col items-center">
      <Text className="text-blue-400 text-xl mb-2">动作识别及计数</Text>
      <View className="w-4/5 h-20 rounded bg-slate-200 flex items-center flex-col py-2">
        <Text className="mb-4">当前动作为：</Text>
        <Text>深蹲</Text>
      </View>

      <View className="flex justify-center flex-wrap mt-2 mb-2">
        {actionItems}
      </View>

      <View className="rounded-full w-[8rem] h-[8rem] border-8 border-solid border-blue-600 flex items-center justify-center">
        {timeVal}s
      </View>
      {isReading ? (
        <Button type="primary" onClick={stopAction}>
          终止识别
        </Button>
      ) : (
        <Button type="primary" onClick={startAction}>
          开始识别
        </Button>
      )}
    </View>
  );
}

export default Action;
