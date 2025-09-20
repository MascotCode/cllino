import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

const SUPPORT_OPTIONS = [
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Find answers to common questions',
    icon: 'help-circle',
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: 'chatbubble',
  },
  {
    id: 'call',
    title: 'Call Us',
    description: 'Speak directly with support',
    icon: 'call',
  },
  {
    id: 'email',
    title: 'Email Support',
    description: 'Send us an email',
    icon: 'mail',
  },
];

export default function SupportScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">Support</Text>
          <Text className="text-gray-600 mt-1">We&apos;re here to help you</Text>
        </View>

        {/* Support Options */}
        <View className="gap-3">
          {SUPPORT_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm active:opacity-90"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                  <Ionicons name={option.icon as any} size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{option.title}</Text>
                  <Text className="text-gray-500 mt-1">{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Contact Info */}
        <View className="mt-8 p-4 bg-gray-50 rounded-2xl">
          <Text className="text-sm font-medium text-gray-900 mb-2">Need immediate help?</Text>
          <Text className="text-sm text-gray-600">
            Call us at <Text className="font-medium text-blue-600">+212 123 456 789</Text>
          </Text>
          <Text className="text-sm text-gray-600">
            Available 24/7 for emergencies
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


