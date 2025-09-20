import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
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

export default function FlatTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Define which routes should be visible in the tab bar
  const VISIBLE_TAB_ROUTES = ['index', 'orders', 'support', 'profile'];

  // Only show the main tab routes
  const visibleRoutes = state.routes.filter((route) => 
    VISIBLE_TAB_ROUTES.includes(route.name)
  );

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
        {visibleRoutes.map((route, index) => {
          const routeIndex = state.routes.findIndex(r => r.key === route.key);
          const { options } = descriptors[route.key];
          const isFocused = state.index === routeIndex;
          
          // Handle label - could be string or function
          let label: string | React.ReactNode = TAB_LABELS[route.name];
          if (!label && options.tabBarLabel) {
            if (typeof options.tabBarLabel === 'function') {
              label = options.tabBarLabel({
                focused: isFocused,
                color: isFocused ? '#1D4ED8' : '#6B7280',
                position: 'below-icon',
                children: route.name
              });
            } else {
              label = options.tabBarLabel;
            }
          }
          if (!label) {
            label = route.name;
          }
          
          const iconName = TAB_ICONS[route.name] || 'ellipse';
          const iconColor = isFocused ? '#1D4ED8' : '#6B7280';
          const labelColor = isFocused ? '#1D4ED8' : '#6B7280';

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const testID = `tid.tabbar.item.${route.name === 'index' ? 'home' : route.name}`;

          return (
            <Pressable
              key={route.key}
              testID={testID}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <View className="items-center justify-center">
                {/* Icon with optional active background */}
                <View 
                  className={`items-center justify-center ${
                    isFocused ? 'w-7 h-7 bg-blue-50 rounded-full' : ''
                  }`}
                >
                  <Ionicons 
                    name={iconName} 
                    size={20} 
                    color={iconColor} 
                  />
                </View>
                
                {/* Label */}
                {typeof label === 'string' ? (
                  <Text
                    className={`text-xs mt-1 ${
                      isFocused ? 'font-medium' : 'font-normal'
                    }`}
                    style={{ color: labelColor }}
                  >
                    {label}
                  </Text>
                ) : (
                  label
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
