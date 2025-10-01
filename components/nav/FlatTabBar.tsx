import { tid } from '@/lib/testing/testIDs';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FlatTabBarProps {
  state?: any;
  descriptors?: any;
  navigation?: any;
}

const PROVIDER_VISIBLE_TABS = new Set(['home', 'earnings', 'profile']);
const PROVIDER_UNIQUE_ROUTES = new Set([
  'earnings', // Only providers have earnings
  'onboarding',
  'invite/[id]',
  'job/[id]',
  'complete/[id]',
]);

export default function FlatTabBar({ state, descriptors, navigation }: FlatTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isProviderFlow = state
    ? state.routes.some((route: any) => PROVIDER_UNIQUE_ROUTES.has(route.name))
    : pathname ? pathname.includes('/(provider)') : false;

  if (state && descriptors && navigation) {
    return (
      <View
        testID="tid.tabbar.container"
        className="bg-surface-0 border-t border-border-subtle"
        style={{
          paddingBottom: Math.max(insets.bottom, 8),
          paddingHorizontal: 0,
          paddingTop: 8,
        }}
      >
        <View className="flex-row h-16 items-center">
          {state.routes
            .filter((route: any) => {
              const { options } = descriptors[route.key];

              if (isProviderFlow) {
                return PROVIDER_VISIBLE_TABS.has(route.name);
              }

              // For public flow, show main tabs only (not flow screens)
              const isMainTab = ['index', 'orders', 'support', 'profile'].includes(route.name);
              const isFlowScreen = ['address', 'price', 'matching', 'confirm', 'rate', 'time'].includes(route.name);
              return isMainTab && !isFlowScreen;
            })
            .map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel || options.title || route.name;
              const originalIndex = state.routes.indexOf(route);
              const isFocused = state.index === originalIndex;
              const iconColor = isFocused ? '#2563EB' : '#9CA3AF';
              const labelClasses = isFocused
                ? 'text-[11px] font-semibold text-primary'
                : 'text-[11px] font-medium text-gray-400';
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              // Generate appropriate testID based on context
              let testID = `tid.tabbar.item.${route.name}`;
              if (isProviderFlow) {
                if (route.name === 'home') {
                  testID = tid.provider.tabs.home;
                } else if (route.name === 'earnings') {
                  testID = tid.provider.tabs.earnings;
                } else if (route.name === 'profile') {
                  testID = tid.provider.tabs.profile;
                }
              }

              return (
                <Pressable
                  key={route.key}
                  testID={testID}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={label}
                  onPress={onPress}
                  className="flex-1 items-center justify-center py-2"
                  style={{ minHeight: 44, minWidth: 44 }}
                >
                  <View className="items-center justify-center">
                    <View className="items-center justify-center mb-1">
                      {options.tabBarIcon && options.tabBarIcon({
                        color: iconColor,
                        size: 24,
                        focused: isFocused,
                      })}
                    </View>
                    <Text className={labelClasses}>
                      {label}
                    </Text>
                    {isFocused && (
                      <View className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </View>
                </Pressable>
              );
            })}
        </View>
      </View>
    );
  }

  // Fallback to hardcoded routes if no props provided (for backward compatibility)
  const publicTabs = [
    { name: 'index', href: '/(public)/', label: 'Home', icon: 'home' as keyof typeof Ionicons.glyphMap },
    { name: 'orders', href: '/(public)/orders', label: 'Orders', icon: 'list' as keyof typeof Ionicons.glyphMap },
    { name: 'support', href: '/(public)/support', label: 'Support', icon: 'help-circle' as keyof typeof Ionicons.glyphMap },
    { name: 'profile', href: '/(public)/profile', label: 'Profile', icon: 'person' as keyof typeof Ionicons.glyphMap },
  ];

  const providerTabs = [
    { name: 'home', href: '/(provider)/home', label: 'Home', icon: 'home' as keyof typeof Ionicons.glyphMap },
    { name: 'earnings', href: '/(provider)/earnings', label: 'Earnings', icon: 'cash' as keyof typeof Ionicons.glyphMap },
    { name: 'profile', href: '/(provider)/profile', label: 'Profile', icon: 'person' as keyof typeof Ionicons.glyphMap },
  ];

  const tabs = isProviderFlow ? providerTabs : publicTabs;

  return (
    <View
      testID="tid.tabbar.container"
      className="bg-surface-0 border-t border-border-subtle"
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 0,
        paddingTop: 8,
      }}
    >
      <View className="flex-row h-16 items-center">
        {tabs.map((tab) => {
          const isFocused = pathname === tab.href || (!isProviderFlow && tab.name === 'index' && pathname === '/(public)');
          const iconColor = isFocused ? '#2563EB' : '#9CA3AF';
          const labelClasses = isFocused
            ? 'text-[11px] font-semibold text-primary'
            : 'text-[11px] font-medium text-gray-400';
          const onPress = () => {
            router.push(tab.href as any);
          };

          const testID = isProviderFlow
            ? tab.name === 'home'
              ? tid.provider.tabs.home
              : tab.name === 'earnings'
                ? tid.provider.tabs.earnings
                : tid.provider.tabs.profile
            : `tid.tabbar.item.${tab.name === 'index' ? 'home' : tab.name}`;

          return (
            <Pressable
              key={tab.name}
              testID={testID}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
              onPress={onPress}
              className="flex-1 items-center justify-center py-2"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <View className="items-center justify-center">
                <View className="items-center justify-center mb-1">
                  <Ionicons
                    name={tab.icon}
                    size={24}
                    color={iconColor}
                  />
                </View>
                <Text className={labelClasses}>
                  {tab.label}
                </Text>
                {isFocused && (
                  <View className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
