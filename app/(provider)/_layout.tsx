import FlatTabBar from '@/components/nav/FlatTabBar';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ProviderLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            tabBar={(props) => <FlatTabBar {...props} />}
        >
            {/* Main tab screens */}
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: "Earnings",
                    tabBarIcon: ({ color, size }) => <Ionicons name="cash" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />

            {/* Hidden stack routes that push over tabs */}
            <Tabs.Screen
                name="onboarding"
                options={{
                    href: null, // Hide from tab bar (handled in FlatTabBar)
                }}
            />
            <Tabs.Screen
                name="invite/[id]"
                options={{
                    href: null, // Hide from tab bar (handled in FlatTabBar)
                }}
            />
            <Tabs.Screen
                name="job/[id]"
                options={{
                    href: null, // Hide from tab bar (handled in FlatTabBar)
                }}
            />
            <Tabs.Screen
                name="complete/[id]"
                options={{
                    href: null, // Hide from tab bar (handled in FlatTabBar)
                }}
            />
        </Tabs>
    );
}
