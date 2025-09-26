import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icon mapping for each tab
const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  orders: 'list',
  support: 'help-circle',
  profile: 'person',
};

// Label mapping for each tab
const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  orders: 'Orders',
  support: 'Support',
  profile: 'Profile',
};

export default function FlatTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Define the tab routes
  const tabs = [
    { name: 'index', href: '/(public)/', label: 'Home', icon: 'home' as keyof typeof Ionicons.glyphMap },
    { name: 'orders', href: '/(public)/orders', label: 'Orders', icon: 'list' as keyof typeof Ionicons.glyphMap },
    { name: 'support', href: '/(public)/support', label: 'Support', icon: 'help-circle' as keyof typeof Ionicons.glyphMap },
    { name: 'profile', href: '/(public)/profile', label: 'Profile', icon: 'person' as keyof typeof Ionicons.glyphMap },
  ];

  return (
    <View
      testID="tid.tabbar.container"
      className="bg-white border-t border-gray-200"
      style={{
        paddingBottom: insets.bottom,
        height: 64 + insets.bottom,
      }}
    >
      <View className="flex-row h-16">
        {tabs.map((tab) => {
          const isFocused = pathname === tab.href || (tab.name === 'index' && pathname === '/(public)');
          const iconColor = isFocused ? '#1D4ED8' : '#6B7280';
          const labelColor = isFocused ? '#1D4ED8' : '#6B7280';

          const onPress = () => {
            router.push(tab.href as any);
          };

          const testID = `tid.tabbar.item.${tab.name === 'index' ? 'home' : tab.name}`;

          return (
            <Pressable
              key={tab.name}
              testID={testID}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
              onPress={onPress}
              className="items-center justify-center flex-1"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <View className="items-center justify-center">
                {/* Icon with optional active background */}
                <View
                  className={`items-center justify-center ${isFocused ? 'w-7 h-7 bg-blue-50 rounded-full' : ''
                    }`}
                >
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={iconColor}
                  />
                </View>

                {/* Label */}
                <Text
                  className={`text-xs mt-1 ${isFocused ? 'font-medium' : 'font-normal'
                    }`}
                  style={{ color: labelColor }}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}