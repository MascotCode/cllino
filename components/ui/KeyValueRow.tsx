import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type KeyValueRowProps = {
  icon?: ReactNode;
  left: string;
};

export default function KeyValueRow({ icon, left }: KeyValueRowProps) {
  return (
    <View className="items-start justify-between gap-component">
      <View className="flex-row items-start flex-1 pr-4 gap-component">
        {icon ? <View className="flex-shrink-0">{icon}</View> : null}
        <Text className="flex-1 text-[16px] leading-[24px] text-gray-700">{left}</Text>
      </View>
    </View>
  );
}
