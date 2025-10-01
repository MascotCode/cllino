import { SERVICE_PRICING } from '@/constants/pricing';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton as Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';
import { fmtMoney } from '../../utils/format';

// MOCK DATA
const ORDER_SUMMARY = {
  service: {
    id: 'deep',
    name: 'Deep Cleaning',
    ...SERVICE_PRICING.deep
  },
  addons: [],
  address: 'Home - 123 Residence Street',
  timeSlot: 'Today, 2:00 PM - 3:30 PM',
  payment: 'Cash on completion'
};

export default function PriceScreen() {
  const params = useLocalSearchParams();
  const total = ORDER_SUMMARY.service.price;

  const formatTimeSlot = () => {
    if (params.when === 'now') {
      return 'Now';
    } else if (params.when === 'schedule' && params.slotStart) {
      const startTime = new Date(params.slotStart as string);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };

      const startTimeStr = startTime.toLocaleTimeString('en-US', timeOptions);
      const endTimeStr = endTime.toLocaleTimeString('en-US', timeOptions);

      return `Today, ${startTimeStr} – ${endTimeStr}`;
    }
    return ORDER_SUMMARY.timeSlot; // fallback to mock data
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Title>Review Order</Title>

        <View className="gap-4 mt-8">
          {/* Service Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Service</Text>
              <View className="pt-3 border-t border-gray-200">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-medium text-gray-900">{ORDER_SUMMARY.service.name}</Text>
                    <Text className="text-sm text-gray-500">{ORDER_SUMMARY.service.duration} minutes</Text>
                  </View>
                  <Text className="font-medium text-gray-900">{fmtMoney(ORDER_SUMMARY.service.price)}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Add-ons Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Add-ons</Text>
              <View className="pt-3 border-t border-gray-200">
                <Text className="py-2 text-center text-gray-500">No add-ons selected</Text>
              </View>
            </View>
          </Card>

          {/* Details Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Details</Text>
              <View className="gap-3 pt-3 border-t border-gray-200">
                <View className="flex-row items-start gap-3">
                  <Ionicons name="location" size={16} color="#6b7280" />
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500">Address</Text>
                    <Text className="text-gray-900">{ORDER_SUMMARY.address}</Text>
                  </View>
                </View>
                <View className="flex-row items-start gap-3">
                  <Ionicons name="time" size={16} color="#6b7280" />
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500">Time Slot</Text>
                    <Text className="text-gray-900">{formatTimeSlot()}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Payment Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Payment</Text>
              <View className="pt-3 border-t border-gray-200">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="cash" size={16} color="#6b7280" />
                  <Text className="text-gray-900">{ORDER_SUMMARY.payment}</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <StickyFooter>
        <View className="p-4 mb-4 bg-gray-50 rounded-xl">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-xl font-bold text-gray-900">Total: {fmtMoney(total)}</Text>
            <Text className="text-gray-500">•</Text>
            <Text className="text-gray-500">{ORDER_SUMMARY.service.duration} mins</Text>
          </View>
        </View>

        <Link href="./matching" asChild>
          <Button variant="primary" testID="confirm-order" className="w-full">
            Confirm Order
          </Button>
        </Link>
      </StickyFooter>
    </SafeAreaView>
  );
}
