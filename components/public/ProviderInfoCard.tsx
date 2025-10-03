import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../ui/Card';

type Props = {
  name: string;
  rating: number;
  etaLabel: string;
  vehicle: string;
  plate: string;
};

export default function ProviderInfoCard({ name, rating, etaLabel, vehicle, plate }: Props) {
  return (
    <Card className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-gray-900" testID="pub.order.provider.name">{name}</Text>
          <View className="mt-1 flex-row items-center gap-[2px]">
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text className="text-[12px] leading-4 text-gray-800" testID="pub.order.provider.rating">{rating.toFixed(1)}</Text>
          </View>
        </View>
        <View className="px-3 py-1 rounded-full bg-green-50 border border-green-200">
          <Text className="text-[12px] font-medium text-green-800" testID="pub.order.eta">{etaLabel}</Text>
        </View>
      </View>

      <View className="my-3 h-px bg-gray-200" />

      <View className="flex-row items-center gap-3">
        <Ionicons name="car-outline" size={16} color="#6b7280" />
        <Text className="text-gray-700" testID="pub.order.vehicle">{vehicle}</Text>
        <View className="w-px h-4 bg-gray-300" />
        <Text className="font-medium text-gray-900" testID="pub.order.plate">{plate}</Text>
      </View>

      <View className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-700" testID="pub.order.cashNotice">Pay cash after service</Text>
        </View>
      </View>
    </Card>
  );
}
