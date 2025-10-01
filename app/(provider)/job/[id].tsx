import Card from '@/components/ui/Card';
import { AppButton as Button } from '@/components/ui/Button';
import KeyValueRow from '@/components/ui/KeyValueRow';
import StatusPill from '@/components/ui/StatusPill';
import StepperDots from '@/components/ui/StepperDots';
import StickyFooter from '@/components/ui/StickyFooter';
import { useProviderState } from '@/lib/provider/store';
import { TActiveJob } from '@/lib/provider/types';
import { tid } from '@/lib/testing/testIDs';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const statusFlow: Record<'assigned' | 'enroute' | 'working', { next: TActiveJob['status']; cta: string; hint: string }> = {
  assigned: {
    next: 'enroute',
    cta: 'Start driving',
    hint: 'Head to the customer right away to stay on schedule.'
  },
  enroute: {
    next: 'working',
    cta: 'Arrived & start',
    hint: 'Let the customer know you have arrived and begin the job.'
  },
  working: {
    next: 'complete',
    cta: 'Complete job',
    hint: 'Finish the service, collect cash, and wrap things up.'
  }
};

const statusLabels: Record<TActiveJob['status'], string> = {
  assigned: 'Assigned',
  enroute: 'On the Way',
  working: 'Working',
  complete: 'Completed'
};

const statusSteps: Record<TActiveJob['status'], 0 | 1 | 2 | 3> = {
  assigned: 0,
  enroute: 1,
  working: 2,
  complete: 3
};

const statusOrder: TActiveJob['status'][] = ['assigned', 'enroute', 'working', 'complete'];

const statusTone: Record<TActiveJob['status'], 'success' | 'neutral' | 'warn'> = {
  assigned: 'neutral',
  enroute: 'warn',
  working: 'success',
  complete: 'success'
};

export default function ActiveJob() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { activeJob, updateJobStatus, refreshJob } = useProviderState();

  useEffect(() => {
    refreshJob();
  }, [refreshJob]);

  const statusKey = (activeJob?.status ?? 'assigned') as TActiveJob['status'];
  const currentStep = statusFlow[statusKey as keyof typeof statusFlow];
  const nextStatus = currentStep?.next ?? 'complete';
  const nextCta = currentStep?.cta ?? 'Continue';
  const nextHint = currentStep?.hint ?? 'Review the job details and keep the customer updated.';

  const nextButtonTestId = useMemo(() => {
    if (!currentStep) return undefined;
    switch (currentStep.next) {
      case 'enroute':
        return tid.provider.job.startDrive;
      case 'working':
        return tid.provider.job.startWork;
      case 'complete':
      default:
        return tid.provider.job.complete;
    }
  }, [currentStep]);

  const jobReference = useMemo(() => (activeJob ? activeJob.id.split('_').pop() ?? activeJob.id : ''), [activeJob]);

  const handleStatusUpdate = async (newStatus: TActiveJob['status']) => {
    if (!activeJob || loading) return;

    setLoading(true);
    try {
      const updated = updateJobStatus(activeJob.id, newStatus);
      if (updated && newStatus === 'complete') {
        router.replace(`/(provider)/complete/${activeJob.id}`);
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
      Alert.alert('Error', 'Failed to update job status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (!activeJob) return;
    const encodedAddress = encodeURIComponent(activeJob.exactAddress);
    const url = `https://maps.google.com/?q=${encodedAddress}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open maps application.');
    });
  };

  if (!activeJob || activeJob.id !== id) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-component">
          <Card className="w-full max-w-md items-center gap-component">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <Ionicons name="close-circle" size={30} color="#e11d48" />
            </View>
            <Text className="text-[22px] leading-[28px] font-bold text-gray-900 text-center">
              No active job
            </Text>
            <Text className="text-center text-[16px] leading-[24px] text-gray-600">
              This job is not active or has already been completed.
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
          <View className="flex-row items-center justify-between">
            <Text className="text-[22px] leading-[28px] font-bold text-gray-900">Active job</Text>
            <StatusPill label={statusLabels[statusKey]} tone={statusTone[statusKey]} />
          </View>

          <Card className="gap-component">
            <View className="gap-minimal">
              <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
                {activeJob.customerName}
              </Text>
              <Text className="text-[16px] leading-[24px] text-gray-700">
                Job #{jobReference}
              </Text>
            </View>
            <View className="rounded-2xl border border-blue-200 bg-blue-50 px-component py-component gap-tight">
              <Text className="text-[28px] leading-[34px] font-extrabold text-blue-700">
                {activeJob.price} MAD
              </Text>
              <Text className="text-[16px] leading-[24px] text-blue-600">
                Cash payout ready once the job is complete
              </Text>
            </View>
            <View className="flex-row justify-end">
              <StepperDots step={statusSteps[statusKey]} />
            </View>
          </Card>

          <Card className="gap-component">
            <View className="flex-row items-center justify-between gap-component">
              <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
                Customer address
              </Text>
              <Pressable
                onPress={handleOpenMaps}
                className="flex-row items-center gap-tight rounded-full border border-blue-200 bg-blue-50 px-component py-tight active:shadow-press active:scale-[0.99]"
                accessibilityRole="button"
                accessibilityLabel="Open navigation"
                accessibilityHint="Opens your maps app with directions"
              >
                <Ionicons name="map" size={16} color="#2563eb" />
                <Text className="text-[16px] leading-[24px] font-semibold text-blue-700">
                  Open maps
                </Text>
              </Pressable>
            </View>
            <Text className="text-[16px] leading-[24px] text-gray-700">
              {activeJob.exactAddress}
            </Text>
          </Card>

          <Card className="gap-component">
            <View className="gap-component">
              {statusOrder.map((status, index) => {
                const statusIndex = statusSteps[statusKey];
                const isActive = status === statusKey;
                const isComplete = index < statusIndex;
                const isUpcoming = index > statusIndex;
                const tone = isActive ? 'primary' : isComplete ? 'success' : 'neutral';

                return (
                  <View
                    key={status}
                    className="flex-row items-center gap-component"
                  >
                    <View
                      className={`h-12 w-12 items-center justify-center rounded-full border ${isActive ? 'border-blue-500 bg-blue-50' : isComplete ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      {isComplete ? (
                        <Ionicons name="checkmark" size={18} color={isActive ? '#2563EB' : '#16a34a'} />
                      ) : (
                        <Text className={`text-[16px] font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{index + 1}</Text>
                      )}
                    </View>
                    <View className="flex-1 gap-tight">
                      <Text className={`text-[16px] leading-[24px] font-semibold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                        {statusLabels[status]}
                      </Text>
                      {isActive && (
                        <Text className="text-[14px] leading-[20px] text-blue-600">{nextHint}</Text>
                      )}
                      {isComplete && !isActive && (
                        <Text className="text-[14px] leading-[20px] text-green-600">Completed</Text>
                      )}
                      {isUpcoming && (
                        <Text className="text-[14px] leading-[20px] text-gray-500">Pending</Text>
                      )}
                    </View>
                    <StatusPill label={statusLabels[status]} tone={tone as any} />
                  </View>
                );
              })}
            </View>
          </Card>

          <Card className="gap-component">
            <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
              Next step
            </Text>
            <KeyValueRow
              icon={(
                <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="information" size={16} color="#2563eb" />
                </View>
              )}
              left={nextHint}
              right={nextCta}
            />
          </Card>
        </View>
      </ScrollView>

      {currentStep && (
        <StickyFooter>
          <Button
            onPress={() => handleStatusUpdate(nextStatus)}
            disabled={loading}
            variant="primary"
            testID={nextButtonTestId}
          >
            {loading ? 'Updating…' : nextCta}
          </Button>
        </StickyFooter>
      )}
    </SafeAreaView>
  );
}
