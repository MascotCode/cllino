import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleUserTypeSelection = async (userType: 'customer' | 'provider') => {
    try {
      await AsyncStorage.setItem('userType', userType);
      router.push('/(onboarding)/language');
    } catch (error) {
      console.error('Error saving user type or navigating:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header with logo/icon */}
      <View className="items-center justify-center flex-1 p-8">
        <View className="items-center justify-center mb-8">
          <View className="items-center justify-center w-24 h-24 mb-6 bg-blue-100 rounded-full">
            <Ionicons name="car-outline" size={48} color="#2563eb" />
          </View>
          <Text className="mb-4 text-3xl font-bold text-center text-gray-900">
            Welcome to Clinoo
          </Text>
          <Text className="text-lg leading-6 text-center text-gray-600">
            Your premium car wash service platform
          </Text>
        </View>
      </View>

      {/* User type selection */}
      <View className="px-8 pb-24">
        <Text className="mb-8 text-xl font-semibold text-center text-gray-900">
          How would you like to continue?
        </Text>

        <View className="gap-4">
          {/* Customer Button */}
          <Pressable
            testID="btn-customer"
            className="p-6 bg-blue-600 rounded-2xl active:opacity-90"
            onPress={() => handleUserTypeSelection('customer')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-2">
                  <Ionicons name="person-outline" size={24} color="white" />
                  <Text className="text-xl font-semibold text-white">
                    Continue as Customer
                  </Text>
                </View>
                <Text className="text-blue-100">
                  Book car wash services for your vehicle
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </Pressable>

          {/* Provider Button */}
          <Pressable
            testID="btn-provider"
            className="p-6 bg-white border-2 border-gray-200 rounded-2xl active:opacity-90"
            onPress={() => handleUserTypeSelection('provider')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-2">
                  <Ionicons name="business-outline" size={24} color="#374151" />
                  <Text className="text-xl font-semibold text-gray-900">
                    Continue as Provider
                  </Text>
                </View>
                <Text className="text-gray-600">
                  Offer your car wash services to customers
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
