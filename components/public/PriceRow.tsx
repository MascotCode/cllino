import { View, Text } from 'react-native';

export default function PriceRow({
  label,
  amountMAD,
  testID,
  secondary,
}: { label: string; amountMAD: number | string; testID?: string; secondary?: string }) {
  return (
    <View className="flex-row items-baseline justify-between">
      <View className="flex-1">
        <Text className="text-gray-900">{label}</Text>
        {secondary ? <Text className="text-sm text-gray-500">{secondary}</Text> : null}
      </View>
      <Text className="text-base font-semibold text-gray-900" testID={testID}>
        {amountMAD} <Text className="font-medium text-gray-700">MAD</Text>
      </Text>
    </View>
  );
}
