import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Countdown from '@/components/ui/Countdown';
import { AppButton as Button } from '@/components/ui/Button';
import MetricTile from '@/components/ui/MetricTile';
import NoticeBanner from '@/components/ui/NoticeBanner';
import StickyFooter from '@/components/ui/StickyFooter';
import { useProviderState } from '@/lib/provider/store';
import { TInvite } from '@/lib/provider/types';
import { tid } from '@/lib/testing/testIDs';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InviteDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentInvite, setCurrentInvite] = useState<TInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const { invites, acceptInvite, declineInvite, getTimeRemaining, activeJob, refreshJob } = useProviderState();

  useEffect(() => {
    const invite = invites.find((inv) => inv.id === id);
    setCurrentInvite(invite ?? null);
  }, [invites, id]);

  const handleAccept = async () => {
    if (!currentInvite || loading) return;

    if (activeJob) {
      Alert.alert('Active job in progress', 'Complete your current job before accepting new invitations.', [{ text: 'OK' }]);
      return;
    }

    const timeRemaining = getTimeRemaining(currentInvite);
    if (timeRemaining <= 0) {
      Alert.alert('Invitation expired', 'This invitation can no longer be accepted.', [{ text: 'OK', onPress: () => router.back() }]);
      return;
    }

    setLoading(true);
    try {
      const job = acceptInvite(currentInvite.id);
      if (job) {
        refreshJob();
        router.replace(`/(provider)/job/${job.id}`);
      } else {
        Alert.alert('Unable to accept', 'This invitation is no longer available.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Failed to accept invite:', error);
      Alert.alert('Error', 'Failed to accept invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    if (!currentInvite || loading) return;

    Alert.alert('Decline invitation', 'Are you sure you want to decline this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          declineInvite(currentInvite.id);
          router.back();
        }
      }
    ]);
  };

  if (!currentInvite) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-component">
          <Card className="w-full max-w-md items-center gap-component" testID={tid.provider.invite.expired}>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <Ionicons name="close-circle" size={30} color="#e11d48" />
            </View>
            <Text className="text-[22px] leading-[28px] font-bold text-gray-900 text-center">
              Invitation not found
            </Text>
            <Text className="text-center text-[16px] leading-[24px] text-gray-600">
              This invitation may have expired or been withdrawn.
            </Text>
            <Button onPress={() => router.back()} variant="primary">
              Back to home
            </Button>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const timeRemaining = getTimeRemaining(currentInvite);
  const isExpired = timeRemaining <= 0;

  if (isExpired) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-component">
          <Card className="w-full max-w-md items-center gap-component border-rose-200 bg-rose-50" testID={tid.provider.invite.expired}>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-rose-500">
              <Ionicons name="time" size={24} color="white" />
            </View>
            <Text className="text-[22px] leading-[28px] font-bold text-rose-900 text-center">
              Invitation expired
            </Text>
            <Text className="text-center text-[16px] leading-[24px] text-rose-800">
              This offer expired before you accepted it. Check your home tab for new invites.
            </Text>
            <Button onPress={() => router.replace('/(provider)/home')} variant="primary">
              Back to home
            </Button>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-component pt-section pb-section gap-section">
          <View className="gap-component">
            <Badge variant="info" className="self-start">
              JOB INVITATION
            </Badge>
            <Card className="gap-component">
              <View className="flex-row items-start justify-between gap-component">
                <View className="flex-1 gap-tight">
                  <Text className="text-[22px] leading-[28px] font-bold text-gray-900">
                    {currentInvite.customerName}
                  </Text>
                  <View className="flex-row items-center gap-tight">
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text className="text-[16px] leading-[24px] text-gray-700">
                      {currentInvite.rating.toFixed(1)} customer rating
                    </Text>
                  </View>
                </View>
                <Countdown
                  initialSeconds={timeRemaining}
                  className="self-start"
                  testID={`countdown-${currentInvite.id}`}
                />
              </View>

              <View className="flex-row gap-component">
                <MetricTile label="Offered fare" value={`${currentInvite.price} MAD`} tone="success" />
                <MetricTile label="ETA" value={`${currentInvite.etaMinutes} min`} tone="primary" />
              </View>
            </Card>
          </View>

          <Card className="gap-component">
            <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
              Service location
            </Text>
            <Text className="text-[16px] leading-[24px] text-gray-700">
              {currentInvite.approxAddress}
            </Text>
            <NoticeBanner
              tone="info"
              title="Exact address shared after acceptance"
              body="We hide the full address until you accept. Once accepted, we will guide you directly to the customer."
            />
          </Card>

          <Card className="gap-component">
            <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
              Before you accept
            </Text>
            <View className="gap-component">
              <View className="flex-row items-start gap-component">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="time-outline" size={16} color="#2563eb" />
                </View>
                <Text className="flex-1 text-[16px] leading-[24px] text-gray-700">
                  Start right away so the customer stays on schedule.
                </Text>
              </View>
              <View className="flex-row items-start gap-component">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="cash-outline" size={16} color="#2563eb" />
                </View>
                <Text className="flex-1 text-[16px] leading-[24px] text-gray-700">
                  Payment is cash on completion—remember to collect it before finishing.
                </Text>
              </View>
              <View className="flex-row items-start gap-component">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="shield-checkmark" size={16} color="#2563eb" />
                </View>
                <Text className="flex-1 text-[16px] leading-[24px] text-gray-700">
                  Only one active job at a time. Decline if you cannot commit.
                </Text>
              </View>
            </View>
          </Card>

          {activeJob && (
            <NoticeBanner
              tone="warn"
              title="Finish your current job first"
              body="You already have a job in progress. Complete it before accepting new invitations."
            />
          )}
        </View>
      </ScrollView>

      <StickyFooter>
        <View className="flex-row gap-component">
          <View className="flex-1">
            <Button
              onPress={handleDecline}
              variant="subtle"
              disabled={loading}
              testID={tid.provider.invite.decline}
            >
              Decline
            </Button>
          </View>
          <View className="flex-1">
            <Button
              onPress={handleAccept}
              variant="primary"
              disabled={loading || !!activeJob}
              testID={tid.provider.invite.accept}
            >
              {loading ? 'Accepting…' : 'Accept job'}
            </Button>
          </View>
        </View>
      </StickyFooter>
    </SafeAreaView>
  );
}
