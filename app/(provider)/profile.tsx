import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeBanner from '@/components/ui/NoticeBanner';
import StatusPill from '@/components/ui/StatusPill';
import { useProviderProfile } from '@/lib/provider/store';
import { tid } from '@/lib/testing/testIDs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProviderProfile() {
  const insets = useSafeAreaInsets();
  const { profile, setOnlineStatus } = useProviderProfile();

  const handleToggleOnline = (online: boolean) => {
    try {
      setOnlineStatus(online);
    } catch (error) {
      console.error('Error toggling online status:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'This will set you offline and return you to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            setOnlineStatus(false);
            router.replace('/(onboarding)/welcome');
          }
        }
      ]
    );
  };

  const isOnline = profile?.isOnline ?? false;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-component pt-section pb-section gap-section">
          <View className="gap-tight">
            <Text className="text-[28px] leading-[34px] font-extrabold text-gray-900">
              Profile
            </Text>
            <Text className="text-[16px] leading-[24px] text-gray-700">
              Manage your provider settings and status.
            </Text>
          </View>

          <Card className="gap-component">
            <View className="flex-row items-center gap-component">
              <View className="items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <Ionicons name="person" size={24} color="#2563eb" />
              </View>
              <View className="flex-1 gap-minimal">
                <Text className="text-[18px] leading-[24px] font-semibold text-gray-900" testID={tid.provider.profile.name}>
                  {profile?.name || 'Provider'}
                </Text>
                <Text className="text-[16px] leading-[24px] text-gray-600" testID={tid.provider.profile.phone}>
                  {profile?.phone || 'No phone'}
                </Text>
              </View>
              <StatusPill label={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'success' : 'muted'} />
            </View>

            <View className="flex-row items-center justify-between gap-component">
              <View className="flex-1 gap-minimal">
                <Text className="text-[16px] leading-[24px] font-medium text-gray-900">
                  Online status
                </Text>
                <Text className="text-[16px] leading-[24px] text-gray-600">
                  {isOnline ? 'Available for job invitations' : 'Not receiving invitations'}
                </Text>
              </View>
              <Switch
                value={isOnline}
                onValueChange={handleToggleOnline}
                testID={tid.provider.profile.toggle}
                accessibilityLabel="Toggle online status"
                accessibilityHint="Switch on to receive job invitations"
                thumbColor={isOnline ? '#15803d' : '#f4f4f5'}
                trackColor={{ false: '#d4d4d8', true: '#bbf7d0' }}
              />
            </View>
          </Card>

          <NoticeBanner
            tone="warn"
            title="Cash payments only"
            body="All jobs are paid in cash on completion. You can handle one job at a time."
          />

          <Card className="gap-component border-rose-200 bg-rose-50">
            <View className="flex-row items-start gap-component">
              <View className="items-center justify-center w-10 h-10 rounded-full bg-rose-500">
                <Ionicons name="log-out" size={18} color="white" />
              </View>
              <View className="flex-1 gap-tight">
                <Text className="text-[18px] leading-[24px] font-semibold text-rose-900">
                  Session management
                </Text>
                <Text className="text-[16px] leading-[24px] text-rose-800">
                  Sign out to clear your session and return to onboarding.
                </Text>
              </View>
            </View>
            <Button
              onPress={handleSignOut}
              variant="danger"
              testID={tid.provider.profile.signout}
            >
              Sign out (mock)
            </Button>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
