import Badge from '@/components/ui/Badge';
import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useOrdersStore, type PublicOrder } from '@/lib/public/ordersStore';
import { fmtMoney } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatTimeSnippet = (order: PublicOrder | undefined) => {
  if (!order) {
    return 'No time selected';
  }

  const { whenLabel, slotStart, slotEnd } = order;

  if (whenLabel && slotStart && slotEnd) {
    return `${whenLabel}, ${slotStart} - ${slotEnd}`;
  }

  if (whenLabel) {
    return whenLabel;
  }

  if (slotStart && slotEnd) {
    return `${slotStart} - ${slotEnd}`;
  }

  return 'No time selected';
};

const formatCompletedAt = (timestamp?: number) => {
  if (!timestamp) {
    return 'N/A';
  }

  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return 'N/A';
  }
};

export default function PublicOrderReceiptScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const orderId = useMemo(() => {
    if (typeof params.id === 'string') {
      return params.id;
    }

    if (Array.isArray(params.id) && params.id.length > 0) {
      return params.id[0];
    }

    return undefined;
  }, [params.id]);

  const order = useOrdersStore((state) => (orderId ? state.findById(orderId) : undefined));

  const totalLabel = order ? fmtMoney(order.price) : fmtMoney(0);
  const completedAtLabel = formatCompletedAt(order?.completedAt ?? order?.createdAt);

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">Order not found</Text>
          <Text className="text-center text-gray-500 mb-6" testID="pub.orders.receipt.notfound">
            We couldn't find that order. It may have been cleared.
          </Text>
          <Button variant="primary" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}>
        <View testID="pub.orders.receipt.title">
          <Text className="text-2xl font-bold text-gray-900">Receipt</Text>
        </View>
        <Text className="text-sm text-gray-500 mt-1">Order #{order.id}</Text>

        <Card className="mt-6 p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-semibold text-gray-900">{order.serviceTitle}</Text>
              <Text className="text-sm text-gray-500">Duration {order.durationMin} mins</Text>
            </View>
            <Badge variant="success">Completed</Badge>
          </View>

          <View className="border-t border-gray-100 pt-4 mt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm text-gray-500">Total</Text>
              <Text className="text-base font-semibold text-gray-900" testID="pub.orders.receipt.total">
                {totalLabel}
              </Text>
            </View>
            <View className="flex-row items-start gap-2 mb-3">
              <Ionicons name="location-outline" size={18} color="#6b7280" />
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Address</Text>
                <Text className="text-base text-gray-900" testID="pub.orders.receipt.address">
                  {order.address}
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2 mb-3">
              <Ionicons name="time-outline" size={18} color="#6b7280" />
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Time</Text>
                <Text className="text-base text-gray-900" testID="pub.orders.receipt.time">
                  {formatTimeSnippet(order)}
                </Text>
              </View>
            </View>
            {(order.vehicle?.makeModel || order.vehicle?.plate) && (
              <View className="flex-row items-start gap-2 mb-3">
                <Ionicons name="car-outline" size={18} color="#6b7280" />
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">Vehicle</Text>
                  <Text className="text-base text-gray-900" testID="pub.orders.receipt.vehicle">
                    {order.vehicle?.makeModel ?? 'N/A'}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">Plate</Text>
                  <Text className="text-base text-gray-900" testID="pub.orders.receipt.plate">
                    {order.vehicle?.plate ?? 'N/A'}
                  </Text>
                </View>
              </View>
            )}
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-done-circle-outline" size={18} color="#6b7280" />
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Completed</Text>
                <Text className="text-base text-gray-900">{completedAtLabel}</Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
