import { useCheckoutStore, type ProviderSummary } from '@/lib/public/checkoutStore';
import { useOrdersStore, type PublicOrder } from '@/lib/public/ordersStore';
import { logInteraction } from '@/utils/analytics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const FALLBACK_STATUS_LABEL = 'Assigned';
const FALLBACK_STEP: PublicTimelineStep['key'] = 'onTheWay';

function SelectedProviderCard({ provider }: { provider: ProviderSummary }) {
  return (
    <View className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <View className="flex-row items-start justify-between">
        <Text className="text-xl font-semibold text-neutral-900" testID="confirm.name">
          {provider.name}
        </Text>
        {provider.eta ? (
          <View className="rounded-full bg-blue-50 px-3 py-1">
            <Text className="text-xs font-medium text-blue-600">{provider.eta}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text className="text-sm font-medium text-neutral-900" testID="confirm.rating">
            {provider.rating ?? 'N/A'}
          </Text>
        </View>
        {provider.distance ? (
          <>
            <Text className="text-neutral-300">|</Text>
            <Text className="text-sm text-neutral-700" testID="confirm.distance">
              {provider.distance}
            </Text>
          </>
        ) : null}
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="car-outline" size={16} color="#4b5563" />
          <Text className="text-sm text-neutral-700" testID="confirm.car">
            {provider.car ?? 'Vehicle details pending'}
          </Text>
        </View>
        <Text className="text-base font-semibold text-neutral-900" testID="confirm.price">
          {provider.price ?? 'N/A'}
        </Text>
      </View>
    </View>
  );
}

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
  const selectedProvider = useCheckoutStore((state) => state.selectedProvider);
  const clearSelectedProvider = useCheckoutStore((state) => state.clearSelectedProvider);

  const statusLabel = order?.status === 'completed'
    ? 'Completed'
    : selectedProvider
      ? 'Provider selected'
      : FALLBACK_STATUS_LABEL;
  const currentStepKey: PublicTimelineStep['key'] = order?.status === 'completed' ? 'completed' : FALLBACK_STEP;

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

    clearSelectedProvider();
    router.replace('/(public)/orders');
  };

  const canMarkComplete = order ? order.status === 'active' : Boolean(selectedProvider);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView className="flex-1 px-4 pb-6" showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <View className="flex-row items-center justify-between py-6 mb-6 bg-white">
          <View>
            <Title>{order?.serviceTitle ?? 'Provider assigned'}</Title>
            <Text className="mt-1 text-sm text-gray-500">{formatOrderTime(order)}</Text>
          </View>
          <Badge variant={order?.status === 'completed' ? 'success' : 'neutral'}>{statusLabel}</Badge>
        </View>

        <View className="mt-4">
          {selectedProvider ? (
            <SelectedProviderCard provider={selectedProvider} />
          ) : (
            <View className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
              <Text className="text-base font-semibold text-neutral-900">No provider selected</Text>
              <Text className="mt-2 text-sm text-neutral-600">
                {order
                  ? 'We will display the provider details as soon as they are assigned to your order.'
                  : 'Choose a provider from the list to see their details here.'}
              </Text>
              {!order && (
                <Button
                  variant="subtle"
                  size="md"
                  className="mt-4 self-start"
                  onPress={() => router.replace('/(public)/matching')}
                >
                  Choose a provider
                </Button>
              )}
            </View>
          )}
        </View>

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
