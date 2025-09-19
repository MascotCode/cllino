import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Screen from '../../components/ui/Screen';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';
import { fmtMoney } from '../../utils/format';

// MOCK DATA
const ORDER_SUMMARY = {
  service: {
    name: 'Deep Cleaning',
    price: 35,
    duration: 90
  },
  addons: [],
  address: 'Home - 123 Residence Street',
  timeSlot: 'Today, 2:00 PM - 3:30 PM',
  payment: 'Cash on completion'
};

export default function PriceScreen() {
  const total = ORDER_SUMMARY.service.price;
  
  return (
    <Screen>
      <View className="px-4 py-6 flex-1">
        <Title>Review Order</Title>
        
        <View className="mt-8 gap-4">
          {/* Service Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Service</Text>
              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-medium text-gray-900">{ORDER_SUMMARY.service.name}</Text>
                    <Text className="text-sm text-gray-500">{ORDER_SUMMARY.service.duration} minutes</Text>
                  </View>
                  <Text className="font-medium text-gray-900">{fmtMoney(ORDER_SUMMARY.service.price, '$')}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Add-ons Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Add-ons</Text>
              <View className="border-t border-gray-200 pt-3">
                <Text className="text-gray-500 text-center py-2">No add-ons selected</Text>
              </View>
            </View>
          </Card>

          {/* Details Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Details</Text>
              <View className="border-t border-gray-200 pt-3 gap-3">
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
                    <Text className="text-gray-900">{ORDER_SUMMARY.timeSlot}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Payment Section */}
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Payment</Text>
              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="cash" size={16} color="#6b7280" />
                  <Text className="text-gray-900">{ORDER_SUMMARY.payment}</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </View>
      
      {/* Sticky Footer */}
      <StickyFooter>
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-xl font-bold text-gray-900">Total: {fmtMoney(total, '$')}</Text>
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
    </Screen>
  );
}
