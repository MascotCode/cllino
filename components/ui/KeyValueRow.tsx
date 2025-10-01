import { ReactNode } from 'react';
import { View, Text } from 'react-native';

type KeyValueRowProps = {
  icon?: ReactNode;
  left: string;
  right: string;
};

export default function KeyValueRow({ icon, left, right }: KeyValueRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-component">
        {icon}
        <Text className="text-[16px] leading-[24px] text-gray-700">{left}</Text>
      </View>
      <Text className="text-[16px] leading-[24px] font-semibold text-gray-900">{right}</Text>
    </View>
  );
}
