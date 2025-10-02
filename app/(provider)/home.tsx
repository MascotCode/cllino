import InviteCard from '@/components/provider/InviteCard';
import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CashNotice from '@/components/ui/CashNotice';
import StatusPill from '@/components/ui/StatusPill';
import StepperDots from '@/components/ui/StepperDots';
import { toggleOnline as toggleOnlineMock } from '@/lib/provider/mock';
import { useProviderState } from '@/lib/provider/store';
import { logInteraction } from '@/utils/analytics';
import { getTimeRemaining } from '@/utils/time';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TActiveJob, TInvite } from '@/lib/provider/types';
import { tid } from '@/lib/testing/testIDs';

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const statusLabels: Record<TActiveJob['status'], string> = {
  assigned: 'Assigned',
  enroute: 'On the Way',
  working: 'Working',
  complete: 'Completed',
};

const statusSteps: Record<TActiveJob['status'], 0 | 1 | 2 | 3> = {
  assigned: 0,
  enroute: 1,
  working: 2,
  complete: 3,
};

type HomeProps = {
  profile: any;
  activeJob: TActiveJob | null;
  invites?: TInvite[];
  handleToggleOnline?: (value?: boolean) => void;
  handleActiveJob: () => void;
  handleViewInvite: (invite: TInvite) => void;
};

const Home: React.FC<HomeProps> = ({
  profile,
  activeJob,
  invites = [],
  handleToggleOnline,
  handleActiveJob,
  handleViewInvite,
}) => {
  const insets = useSafeAreaInsets();
  const [localOnline, setLocalOnline] = React.useState<boolean>(profile?.isOnline ?? false);

  React.useEffect(() => {
    if (typeof profile?.isOnline === 'boolean') {
      setLocalOnline(profile.isOnline);
    }
  }, [profile?.isOnline]);

  const isOnline = handleToggleOnline ? profile?.isOnline ?? false : localOnline;
  const firstName = profile?.name?.split(' ')[0] ?? 'Provider';
  const jobStatus = activeJob?.status ?? 'assigned';
  const statusTone = jobStatus === 'working' ? 'success' : 'neutral';

  const onToggleOnline = React.useCallback(
    (value: boolean) => {
      logInteraction({
        elementId: tid.provider.toggle,
        route: '/(provider)/home',
        meta: { value },
      });
      if (handleToggleOnline) {
        handleToggleOnline(value);
      } else {
        toggleOnlineMock(value);
        setLocalOnline(value);
      }
    },
    [handleToggleOnline]
  );

  const handleCashNoticeLearnMore = React.useCallback(() => {
    Alert.alert(
      'Cash-only reminder',
      'All provider jobs are cash on completion. Confirm that you received payment before finishing.'
    );
  }, []);

  const hasInvites = invites.length > 0;
  const shouldShowInvites = isOnline && hasInvites;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View className="bg-white gap-tight px-component pt-section pb-section">
          <Text className="text-[28px] leading-[34px] font-extrabold text-gray-900">
            Good {getTimeOfDay()}, {firstName}
          </Text>
          <Text className="text-[16px] leading-[24px] text-gray-700">
            {isOnline
              ? 'You are visible to nearby cash jobs.'
              : 'Switch online to start receiving new requests.'}
          </Text>
        </View>
        <View className="px-component pt-section pb-section gap-section">


          <Card className="gap-component">
            <View className="flex-row items-center justify-between gap-component">
              <View className="flex-1 gap-minimal">
                <Text className="text-[22px] leading-[28px] font-bold text-gray-900">
                  {profile?.name ?? 'Your profile'}
                </Text>
                <Text className="text-[16px] leading-[24px] text-gray-600">
                  {profile?.phone || 'No phone on file'}
                </Text>
              </View>
              <StatusPill
                label={isOnline ? 'Online' : 'Offline'}
                tone={isOnline ? 'success' : 'muted'}
              />
            </View>
            <View className="flex-row items-center justify-between gap-component">
              <Text className="flex-1 text-[16px] leading-[24px] text-gray-700">
                {isOnline
                  ? 'Listening for nearby cash jobs.'
                  : 'Go online when you are ready to accept cash jobs.'}
              </Text>
              <Switch
                accessibilityLabel="Toggle online status"
                accessibilityHint="Switch on to start receiving job requests"
                value={isOnline}
                onValueChange={onToggleOnline}
                testID={tid.provider.toggle}
                thumbColor={isOnline ? '#0f766e' : '#f4f4f5'}
                trackColor={{ false: '#d4d4d8', true: '#99f6e4' }}
              />
            </View>
          </Card>

          {activeJob && (
            <Pressable
              onPress={handleActiveJob}
              className="active:shadow-press active:scale-[0.99]"
              accessibilityRole="button"
              accessibilityLabel="View active job"
              accessibilityHint="Opens the active job details"
            >
              <Card className="border-blue-200 gap-component bg-blue-50">
                <View className="flex-row items-start justify-between gap-component">
                  <View className="gap-minimal">
                    <Text className="text-[12px] leading-[16px] font-semibold uppercase text-blue-600">
                      Active job
                    </Text>
                    <Text className="text-[18px] leading-[24px] font-semibold text-gray-900" numberOfLines={1}>
                      {activeJob.customerName}
                    </Text>
                    <View className="flex-row items-center gap-tight">
                      <Ionicons name="time-outline" size={14} color="#2563EB" />
                      <Text className="text-[14px] leading-[20px] text-blue-700">
                        Started {new Date(activeJob.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end gap-minimal">
                    <StatusPill label={statusLabels[jobStatus]} tone={statusTone} />
                    <Text className="text-[12px] leading-[16px] font-semibold uppercase text-gray-500">Progress</Text>
                    <StepperDots step={statusSteps[jobStatus]} />
                  </View>
                </View>
                <View className="bg-white border border-blue-200 rounded-2xl px-component py-component gap-tight">
                  <Text className="text-[32px] leading-[38px] font-extrabold text-blue-700">
                    {activeJob.price} MAD
                  </Text>
                  <Text className="text-[14px] leading-[20px] text-blue-600">
                    Cash payout when the job is complete
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}

          <View className="gap-component">
            <View className="flex-row items-center justify-between">
              <Text className="text-[22px] leading-[28px] font-bold text-gray-900">
                Job requests
              </Text>
              {shouldShowInvites && (
                <Text className="text-[16px] leading-[24px] text-gray-500">
                  {invites.length} new
                </Text>
              )}
            </View>

            {!isOnline ? (
              <Card className="items-center gap-component border-slate-200 bg-slate-50">
                <View className="relative items-center justify-center">
                  <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-slate-100 border-2 border-dashed border-slate-300">
                    <Ionicons name="locate-outline" size={28} color="#1F2937" />
                  </View>
                  <View className="absolute inset-0 -m-3 rounded-[28px] border border-dashed border-slate-200" />
                  <View className="absolute items-center justify-center w-12 h-12 border-4 rounded-full -bottom-3 -right-3 bg-rose-500 border-slate-50">
                    <Ionicons name="power" size={18} color="#FFFFFF" />
                  </View>
                </View>
                <View className="items-center gap-tight">
                  <Text className="text-[18px] leading-[24px] font-semibold text-gray-900 text-center">
                    You’re offline
                  </Text>
                  <Text className="text-center text-[16px] leading-[24px] text-gray-600">
                    Flip your status online to get new cash job pings in your area.
                  </Text>
                </View>
                <Button onPress={() => onToggleOnline(true)} variant="primary" size="md" className="px-6 min-h-11">
                  Go online
                </Button>
              </Card>
            ) : shouldShowInvites ? (
              <View className="gap-component">
                <FlatList
                  data={invites.slice(0, 3)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <InviteCard
                      invite={item}
                      timeRemaining={getTimeRemaining(item)}
                      onPress={handleViewInvite}
                    />
                  )}
                  ItemSeparatorComponent={() => <View className="h-element" />}
                  scrollEnabled={false}
                />
              </View>
            ) : (
              <Card className="flex-row items-start border-blue-200 gap-component bg-blue-50">
                <View className="items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <Ionicons name="radio-outline" size={20} color="white" />
                </View>
                <View className="flex-1 gap-tight">
                  <Text className="text-[16px] leading-[24px] font-semibold text-blue-900">
                    Listening for job requests in your area.
                  </Text>
                  <Text className="text-[14px] leading-[20px] text-blue-700">
                    You’ll see new job requests here as soon as they’re available.
                  </Text>
                </View>
              </Card>
            )}
          </View>

          <CashNotice testID={tid.provider.cashNotice.home} onLearnMore={handleCashNoticeLearnMore} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProviderHomeScreen: React.FC = () => {
  const router = useRouter();
  const {
    profile,
    setOnlineStatus,
    invites,
    activeJob,
  } = useProviderState();

  const handleToggleOnline = React.useCallback(
    (value?: boolean) => {
      setOnlineStatus(Boolean(value));
    },
    [setOnlineStatus]
  );

  const handleActiveJob = React.useCallback(() => {
    if (activeJob) {
      router.push(`/(provider)/job/${activeJob.id}`);
    }
  }, [activeJob, router]);

  const handleInvite = React.useCallback(
    (invite: TInvite) => {
      router.push(`/(provider)/invite/${invite.id}`);
    },
    [router]
  );

  return (
    <Home
      profile={profile}
      activeJob={activeJob}
      invites={invites}
      handleToggleOnline={handleToggleOnline}
      handleActiveJob={handleActiveJob}
      handleViewInvite={handleInvite}
    />
  );
};

export default ProviderHomeScreen;
export { Home };
