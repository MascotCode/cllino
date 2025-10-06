import JobTimeline, { TimelineStep } from '@/components/provider/JobTimeline';
import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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

  const timelineSteps = useMemo((): TimelineStep[] => {
    const order: Array<{ key: TimelineStep['key']; status: TActiveJob['status']; description: string }> = [
      { key: 'assigned', status: 'assigned', description: 'Head to the customer right away to stay on schedule.' },
      { key: 'onTheWay', status: 'enroute', description: 'Let the customer know you are on the way.' },
      { key: 'working', status: 'working', description: 'Perform the job as agreed and keep the customer in the loop.' },
      { key: 'completed', status: 'complete', description: 'Wrap up the visit and confirm the cash payout.' },
    ];

    const activeIndex = order.findIndex((item) => item.status === statusKey);

    return order.map((item, index) => {
      let state: TimelineStep['state'] = 'pending';

      if (activeIndex === -1) {
        state = index === 0 ? 'current' : 'pending';
      } else if (statusKey === 'complete') {
        state = index <= activeIndex ? 'completed' : 'pending';
      } else if (index < activeIndex) {
        state = 'completed';
      } else if (index === activeIndex) {
        state = 'current';
      }

      return {
        key: item.key,
        title: statusLabels[item.status],
        description: item.description,
        state,
      };
    });
  }, [statusKey]);


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
        <View className="items-center justify-center flex-1 px-component">
          <Card className="items-center w-full max-w-md gap-component">
            <View className="items-center justify-center w-16 h-16 rounded-full bg-rose-100">
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
        stickyHeaderIndices={[0]}
      >
        <View className="flex-row items-center justify-between bg-white py-section px-component pt-section">
          <Text className="text-[22px] leading-[28px] ml-4 font-bold text-gray-900">Active job</Text>
          <StatusPill label={statusLabels[statusKey]} tone={statusTone[statusKey]} />
        </View>
        <View className="px-component pt-section pb-section gap-section">

          <Card className="gap-component">
            <View className="gap-minimal">
              <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
                {activeJob.customerName}
              </Text>
              <Text className="text-[16px] leading-[24px] text-gray-700">
                Job #{jobReference}
              </Text>
            </View>
            <View className="border border-blue-200 rounded-2xl bg-blue-50 px-component py-component gap-tight">
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
            <JobTimeline steps={timelineSteps} />
          </Card>

          <Card className="gap-component">
            <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
              Next step
            </Text>
            <KeyValueRow
              icon={(
                <View className="items-center justify-center bg-blue-100 rounded-full h-9 w-9">
                  <Ionicons name="information" size={16} color="#2563eb" />
                </View>
              )}
              left={nextHint}
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
