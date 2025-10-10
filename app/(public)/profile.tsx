import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

const handleSignOut = () => {
  Alert.alert(
    'Sign out',
    'This will sign you out of your account',
    [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: () => { router.replace('/(onboarding)/welcome'); } }]
  );
};

const PROFILE_SECTIONS = [
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Update your personal information',
    icon: 'person',
  },
  {
    id: 'payment',
    title: 'Payment Methods',
    description: 'Manage your cards and payment options',
    icon: 'card',
  },
  {
    id: 'addresses',
    title: 'Saved Addresses',
    description: 'Manage your frequently used locations',
    icon: 'location',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control what notifications you receive',
    icon: 'notifications',
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Manage your privacy settings',
    icon: 'shield-checkmark',
  },
];

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 mt-12" contentContainerClassName='pb-12' stickyHeaderIndices={[0]}>
        {/* Header */}
        <View className="flex-1 h-24 py-6 mb-8 bg-white">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <Text className="mt-1 text-gray-600">Manage your account and preferences</Text>
        </View>

        {/* User Info Card */}
        <View className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-16 h-16 mr-4 bg-blue-100 rounded-full">
              <Text className="text-xl font-bold text-blue-600">JD</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">John Doe</Text>
              <Text className="text-gray-500">john.doe@example.com</Text>
              <Text className="text-gray-500">+212 123 456 789</Text>
            </View>
            <Pressable>
              <Ionicons name="pencil" size={20} color="#6b7280" />
            </Pressable>
          </View>
        </View>

        {/* Profile Sections */}
        <View className="gap-3">
          {PROFILE_SECTIONS.map((section) => (
            <Pressable
              key={section.id}
              className="p-4 bg-white border border-gray-200 shadow-sm rounded-2xl active:opacity-90"
            >
              <View className="flex-row items-center">
                <View className="items-center justify-center w-12 h-12 mr-4 bg-gray-100 rounded-full">
                  <Ionicons name={section.icon as any} size={20} color="#6b7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{section.title}</Text>
                  <Text className="mt-1 text-gray-500">{section.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <Pressable onPress={handleSignOut} className="p-4 mt-8 border border-red-200 bg-red-50 rounded-2xl">
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out" size={20} color="#dc2626" />
            <Text className="ml-2 font-medium text-red-600">Sign Out</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}


