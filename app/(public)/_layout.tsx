import FlatTabBar from '@/components/nav/FlatTabBar';
import { Tabs } from 'expo-router';

export default function PublicLayout() {
  return (
    <Tabs
      tabBar={() => <FlatTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
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
