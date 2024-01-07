import { View, Text } from "@tarojs/components";
import { actions } from "../../consts/actions";
import { Image, Collapse, Button, Progress } from "@nutui/nutui-react-taro";
import { useState } from "react";
import { ArrowDown, FaceSmile } from "@nutui/icons-react-taro";
import ble from "../../bluetooth";
import { saveData } from "../../api";

function Action() {
  const [showProgress, setShowProgress] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [second, setSecond] = useState(0);
  const [isReading, setIsReading] = useState(Array(actions.length).fill(false));
  const [accelerometerX, setAccelerometerX] = useState(0);
  const [accelerometerY, setAccelerometerY] = useState(0);
  const [accelerometerZ, setAccelerometerZ] = useState(0);
  const [gyroscopeX, setGyroscopeX] = useState(0);
  const [gyroscopeY, setGyroscopeY] = useState(0);
  const [gyroscopeZ, setGyroscopeZ] = useState(0);
  const [accXs, setAccXs] = useState([]);
  const [accYs, setAccYs] = useState([]);
  const [accZs, setAccZs] = useState([]);
  const [rgXs, setRgXs] = useState([]);
  const [rgYs, setRgYs] = useState([]);
  const [rgZs, setRgZs] = useState([]);
  const [times, setTimes] = useState([]);

  const actionItems = actions.map((item) => (
    <View className="flex flex-col w-[45%] mb-2 px-2 items-center">
      <Image src={item.img} mode="scaleToFill" width={120} height={120}></Image>
      <Text>{item.title}</Text>
    </View>
  ));

  const actionBtns = actions.map((item, index) => (
    <View className="flex justify-between mt-2 w-4/5 ml-8">
      <Button
        type="info"
        color={isReading[index] ? "green" : "rgb(76, 108, 244)"}
        onClick={() => handleActionBtnClick(index)}
      >
        {isReading[index] ? "暂停读取" : "开始" + item.title}
      </Button>
      <Button type="info" onClick={() => SaveToDB(item.code)}>
        {item.code}动作存储10s
      </Button>
    </View>
  ));

  function handleActionBtnClick(actionIndex) {
    const isReadingArr = isReading.slice();
    isReadingArr[actionIndex] = !isReadingArr[actionIndex];
    setIsReading(isReadingArr);
    // 开始读取传感器数据
    if (isReadingArr[actionIndex]) {
      setShowProgress(true);
      setAccXs([]);
      setAccYs([]);
      setAccZs([]);
      setRgXs([]);
      setRgYs([]);
      setRgZs([]);
      const startTime = new Date().getTime();

      let accXs = [];
      let accYs = [];
      let accZs = [];
      let rgXs = [];
      let rgYs = [];
      let rgZs = [];

      //开始监听加速度数据
      wx.startAccelerometer({
        interval: ble.platform === "ios" ? "game" : "ui",
        success: (res) => {
          console.log("调用成功");
          //监听加速度数据事件
          wx.onAccelerometerChange((res) => {
            let midTime = new Date().getTime();
            let timeStep = (midTime - startTime) / 1000;
            if (timeStep < 10) {
              setProgressPercent(parseInt(timeStep * 10));
              setSecond(parseInt(timeStep));
              accXs.push(res.x);
              accYs.push(res.y);
              accZs.push(res.z);
              let timesArr = times.slice();
              timesArr.push(midTime);
              setTimes(timesArr);
              setAccelerometerX(parseFloat(res.x.toFixed(5)));
              setAccelerometerY(parseFloat(res.y.toFixed(5)));
              setAccelerometerZ(parseFloat(res.z.toFixed(5)));
            } else {
              stopAction(actionIndex);
              setRgXs(rgXs);
              setRgYs(rgYs);
              setRgZs(rgZs);
              wx.offAccelerometerChange();
            }
          });
        },
        fail: (res) => {
          console.log(res);
        },
      });
      //开始监听陀螺仪数据
      wx.startGyroscope({
        interval: ble.platform === "ios" ? "game" : "ui",
        success: (res) => {
          console.log("调用成功");
          //监听陀螺仪数据变化事件
          wx.onGyroscopeChange((res) => {
            let midTime = new Date().getTime();
            let timeStep = (midTime - startTime) / 1000;
            if (timeStep < 10) {
              setProgressPercent(parseInt(timeStep * 10));
              setSecond(parseInt(timeStep));
              rgXs.push(res.x);
              rgYs.push(res.y);
              rgZs.push(res.z);
              let timesArr = times.slice();
              timesArr.push(midTime);
              setTimes(timesArr);
              setGyroscopeX(parseFloat(res.x.toFixed(5)));
              setGyroscopeY(parseFloat(res.y.toFixed(5)));
              setGyroscopeZ(parseFloat(res.z.toFixed(5)));
            } else {
              stopAction(actionIndex);
              setRgXs(rgXs);
              setRgYs(rgYs);
              setRgZs(rgZs);
              wx.offGyroscopeChange();
            }
          });
        },
        fail: (res) => {
          console.log(res);
        },
      });
    }
  }

  function stopAction(index) {
    if (!isReadingArr[index]) {
      return;
    }
    const isReadingArr = isReading.slice();
    isReadingArr[index] = false;
    setIsReading(isReadingArr);
    setShowProgress(false);
    setProgressPercent(0);
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

  function SaveToDB(actionCode) {
    const activity = actionCode.charCodeAt() - "A".charCodeAt() + 1;
    const data = {
      activity,
      accx: accXs,
      accy: accYs,
      accz: accZs,
      gryx: rgXs,
      gryy: rgYs,
      gryz: rgZs,
      time: times,
    };
    saveData(actionCode, data);
  }

  function Prog() {
    if (!showProgress) {
      return null;
    }
    return (
      <View className="w-4/5 items-center justify-center flex">
        <Progress
          percent={progressPercent}
          color="#4dff4d"
          background="#d9d9d9"
        />
        <Text>{second}s</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex flex-col items-center">
        <Text className="text-blue-400 text-xl mb-2">数据采集</Text>

        <View className="flex justify-center flex-wrap mt-2 mb-2">
          {actionItems}
        </View>
      </View>
      <Collapse defaultActiveName={["1"]} accordion expandIcon={<ArrowDown />}>
        <Collapse.Item title="六轴传感器数据" name="1">
          <View className="flex mb-2 text-base w-full justify-between">
            <Text className="pl-4">X轴加速度</Text>
            <Text className="pr-8">{accelerometerX}</Text>
          </View>
          <View className="flex mb-2 text-base w-full justify-between">
            <Text className="pl-4">Y轴加速度</Text>
            <Text className="pr-8">{accelerometerY}</Text>
          </View>
          <View className="flex mb-2 text-base w-full justify-between">
            <Text className="pl-4">Z轴加速度</Text>
            <Text className="pr-8">{accelerometerZ}</Text>
          </View>
          <View className="flex mb-2 text-base w-full justify-between">
            <Text className="pl-4">X轴角速度</Text>
            <Text className="pr-8">{gyroscopeX}</Text>
          </View>
          <View className="flex mb-2 text-base w-full justify-between">
            <Text className="pl-4">Y轴角速度</Text>
            <Text className="pr-8">{gyroscopeY}</Text>
          </View>
          <View className="flex mb-2 text-base w-full justify-between">
            <Text className="pl-4">Z轴角速度</Text>
            <Text className="pr-8">{gyroscopeZ}</Text>
          </View>
        </Collapse.Item>
      </Collapse>
      <View className="flex items-center w-full justify-center">
        <Prog />
      </View>
      {actionBtns}
    </>
  );
}

export default Action;
