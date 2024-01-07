import { Image } from "@nutui/nutui-react-taro";
import { View, Text } from "@tarojs/components";

export default function ActionCard({
  imgSrc,
  title,
  actualNum = 0,
  standardNum = 0,
}) {
  return (
    <View className="flex flex-col w-[45%] mb-2 px-2 items-center">
      <Image src={imgSrc} mode="scaleToFill" width={120} height={120}></Image>
      <Text>{title}</Text>
      <View className="flex items-center">
        <Text className="mr-2">实际数:{actualNum}</Text>
        <Text>标准数:{standardNum}</Text>
      </View>
    </View>
  );
}
