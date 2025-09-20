import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
      <ScrollView className="flex-1 px-4 pt-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <Text className="text-gray-600 mt-1">Manage your account and preferences</Text>
        </View>

        {/* User Info Card */}
        <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mr-4">
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
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm active:opacity-90"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                  <Ionicons name={section.icon as any} size={20} color="#6b7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{section.title}</Text>
                  <Text className="text-gray-500 mt-1">{section.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <Pressable className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-200">
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out" size={20} color="#dc2626" />
            <Text className="text-red-600 font-medium ml-2">Sign Out</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}


