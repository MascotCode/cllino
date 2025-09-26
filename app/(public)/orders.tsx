import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

export default function OrdersScreen() {
  return (
    <View className="flex-1 bg-white pt-6">
      <ScrollView className="flex-1 px-4 pt-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">Your Orders</Text>
          <Text className="text-gray-600 mt-1">Track your service bookings</Text>
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center py-16">
          <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-6">
            <Ionicons name="list" size={32} color="#2563eb" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">No orders yet</Text>
          <Text className="text-gray-500 text-center max-w-xs">
            Your service bookings will appear here once you place your first order.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


