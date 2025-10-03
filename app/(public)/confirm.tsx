import { useOrdersStore, type PublicOrder } from '@/lib/public/ordersStore';
import { logInteraction } from '@/utils/analytics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProviderInfoCard from '../../components/public/ProviderInfoCard';
import PublicJobTimeline, { PublicTimelineStep } from '../../components/public/PublicJobTimeline';
import Badge from '../../components/ui/Badge';
import { AppButton as Button } from '../../components/ui/Button';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';

type JobStepDefinition = {
  key: PublicTimelineStep['key'];
  title: string;
  description: string;
};

const FALLBACK_JOB = {
  statusLabel: 'Assigned',
  etaLabel: 'ETA 15:20',
  currentStep: 'onTheWay' as PublicTimelineStep['key'],
  provider: {
    name: 'John',
    rating: 4.8,
    vehicle: 'Toyota Camry',
    plate: 'ABC-123',
  },
};

const TIMELINE_DEFINITION: JobStepDefinition[] = [
  {
    key: 'assigned',
    title: 'Assigned',
    description: 'Your provider is on the way to you.',
  },
  {
    key: 'onTheWay',
    title: 'On the way',
    description: 'Track their arrival and make access clear.',
  },
  {
    key: 'working',
    title: 'Working',
    description: 'Service in progress. Pay cash after finish.',
  },
  {
    key: 'completed',
    title: 'Completed',
    description: 'Service done. Mark complete if all good.',
  },
];

const formatOrderTime = (order?: PublicOrder) => {
  if (!order) {
    return 'Schedule pending';
  }

  const { whenLabel, slotStart, slotEnd } = order;

  if (whenLabel && slotStart && slotEnd) {
    return `${whenLabel}, ${slotStart} - ${slotEnd}`;
  }

  if (whenLabel) {
    return whenLabel;
  }

  if (slotStart && slotEnd) {
    return `${slotStart} - ${slotEnd}`;
  }

  return 'Schedule pending';
};

export default function ConfirmScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const orderId = useMemo(() => {
    if (typeof params.id === 'string') {
      return params.id;
    }

    if (Array.isArray(params.id) && params.id.length > 0) {
      return params.id[0];
    }

    return undefined;
  }, [params.id]);

  const order = useOrdersStore((state) => (orderId ? state.findById(orderId) : undefined));
  const completeOrder = useOrdersStore((state) => state.completeOrder);

  const statusLabel = order?.status === 'completed' ? 'Completed' : FALLBACK_JOB.statusLabel;
  const currentStepKey: PublicTimelineStep['key'] = order?.status === 'completed' ? 'completed' : FALLBACK_JOB.currentStep;

  const steps: PublicTimelineStep[] = useMemo(() => {
    const activeIndex = TIMELINE_DEFINITION.findIndex((step) => step.key === currentStepKey);
    const currentIndex = activeIndex >= 0 ? activeIndex : 0;

    return TIMELINE_DEFINITION.map((step, index) => {
      let state: PublicTimelineStep['state'] = 'pending';
      if (index < currentIndex) {
        state = 'completed';
      } else if (index === currentIndex) {
        state = 'current';
      }

      if (order?.status === 'completed') {
        state = index <= currentIndex ? 'completed' : 'pending';
      }

      return {
        key: step.key,
        title: step.title,
        description: step.description,
        state,
      };
    });
  }, [order?.status, currentStepKey]);

  const handleMarkComplete = () => {
    // Log analytics
    logInteraction({
      route: '/(public)/confirm',
      elementId: 'pub.order.markComplete',
      meta: { orderId, service: order?.serviceTitle }
    });

    if (orderId) {
      completeOrder(orderId);
    }

    router.replace('/(public)/orders');
  };

  const canMarkComplete = order ? order.status === 'active' : true;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Title>{order?.serviceTitle ?? 'Provider assigned'}</Title>
            <Text className="mt-1 text-sm text-gray-500">{formatOrderTime(order)}</Text>
          </View>
          <Badge variant={order?.status === 'completed' ? 'success' : 'neutral'}>{statusLabel}</Badge>
        </View>

        <ProviderInfoCard
          name={FALLBACK_JOB.provider.name}
          rating={FALLBACK_JOB.provider.rating}
          etaLabel={FALLBACK_JOB.etaLabel}
          vehicle={FALLBACK_JOB.provider.vehicle}
          plate={FALLBACK_JOB.provider.plate}
        />

        {order && (
          <View className="p-4 mt-4 border border-gray-200 rounded-2xl bg-gray-50">
            <Text className="text-sm font-semibold text-gray-700">Details</Text>
            <View className="gap-2 mt-3">
              <Text className="text-sm text-gray-500">Address</Text>
              <Text className="text-base text-gray-900">{order.address}</Text>
              <Text className="mt-3 text-sm text-gray-500">Created</Text>
              <Text className="text-base text-gray-900">{new Date(order.createdAt).toLocaleString()}</Text>
            </View>
          </View>
        )}

        <View className="mt-6 mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">Status</Text>
          <PublicJobTimeline steps={steps} />
        </View>
      </ScrollView>

      <StickyFooter>
        <Button
          variant="primary"
          testID="pub.order.markComplete"
          className="w-full"
          disabled={!canMarkComplete}
          onPress={handleMarkComplete}
        >
          {order?.status === 'completed' ? 'Completed' : 'Mark complete'}
        </Button>
      </StickyFooter>
    </SafeAreaView>
  );
}
