import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import Title from '../../components/ui/Title';

// MOCK DATA
const SAVED_ADDRESSES = [
  {
    id: 'home',
    label: 'Home',
    address: '123 Residence Street',
    notes: 'Apartment 4B, Blue building',
    icon: 'home' as const
  },
  {
    id: 'work',
    label: 'Work',
    address: '456 Business Avenue',
    notes: 'Office complex, parking level B1',
    icon: 'business' as const
  }
];

export default function AddressScreen() {
  const params = useLocalSearchParams();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View className="px-4 py-6 flex-1">
        <Title>Select Address</Title>
        
        <View className="mt-8 gap-3">
          {SAVED_ADDRESSES.map((addr) => {
            const handleAddressSelect = () => {
              const query = new URLSearchParams({
                ...Object.entries(params).reduce((acc, [key, value]) => {
                  acc[key] = String(value);
                  return acc;
                }, {} as Record<string, string>),
                addressLabel: `${addr.label} - ${addr.address}`,
                lat: addr.id === 'home' ? '33.5731' : '33.5831',
                lng: addr.id === 'home' ? '-7.5898' : '-7.5798'
              });
              router.push(`./time?${query.toString()}`);
            };

            return (
              <Pressable
                key={addr.id}
                testID={`address-${addr.id}`}
                onPress={handleAddressSelect}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm active:opacity-90"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-3 mb-2">
                      <Ionicons name={addr.icon} size={20} color="#3b82f6" />
                      <Text className="text-lg font-semibold text-gray-900">{addr.label}</Text>
                    </View>
                    <Text className="text-gray-900 mb-1">{addr.address}</Text>
                    <Text className="text-sm text-gray-500">{addr.notes}</Text>
                  </View>
                  <View className="ml-4 flex-row items-center gap-2">
                    <Pressable className="p-2">
                      <Ionicons name="ellipsis-vertical" size={16} color="#9ca3af" />
                    </Pressable>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="border-t border-gray-200 pt-4 mt-6">
          <Pressable 
            testID="add-address"
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm active:opacity-90 border-dashed"
          >
            <View className="flex-row items-center justify-center gap-3">
              <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
              <Text className="text-lg font-medium text-gray-600">Add New Address</Text>
            </View>
          </Pressable>
        </View>
        
        <View className="mt-8">
          <Button variant="subtle" testID="use-current-location">
            📍 Use Current Location
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}