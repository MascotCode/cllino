import { View, Text } from 'react-native';

export default function TotalPill({ totalMAD, durationMins }:{
  totalMAD: number | string; durationMins?: number;
}) {
  return (
    <View className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 items-center" testID="pub.review.total">
      <Text className="text-base font-semibold text-gray-900">
        Total: {totalMAD} MAD{typeof durationMins === 'number' ? ` · ${durationMins} mins` : ''}
      </Text>
    </View>
  );
}
