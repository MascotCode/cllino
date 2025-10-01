import FlatTabBar from '@/components/nav/FlatTabBar';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function PublicLayout() {
  return (
    <Tabs
      tabBar={(props) => <FlatTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, size }) => <Ionicons name="help-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      {/* Keep existing flow screens as hidden tabs that don't show in tab bar */}
      <Tabs.Screen
        name="address"
        options={{
          title: 'Address',
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="price"
        options={{
          title: 'Price',
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: 'Matching',
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="confirm"
        options={{
          title: 'Confirmation',
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="rate"
        options={{
          title: 'Rate Service',
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
