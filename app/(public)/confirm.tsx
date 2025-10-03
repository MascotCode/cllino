import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/ui/Badge';
import { AppButton as Button } from '../../components/ui/Button';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';
import ProviderInfoCard from '../../components/public/ProviderInfoCard';
import PublicJobTimeline, { PublicTimelineStep } from '../../components/public/PublicJobTimeline';

type JobStepDefinition = {
  key: PublicTimelineStep['key'];
  title: string;
  description: string;
};

const order = {
  statusLabel: 'Assigned',
  etaLabel: 'ETA 15:20',
  currentStep: 'onTheWay' as PublicTimelineStep['key'],
  canMarkComplete: true,
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

export default function ConfirmScreen() {
  const job = order;

  const activeIndex = TIMELINE_DEFINITION.findIndex((step) => step.key === job.currentStep);
  const currentIndex = activeIndex >= 0 ? activeIndex : 0;
  const steps: PublicTimelineStep[] = TIMELINE_DEFINITION.map((step, index) => {
    let state: PublicTimelineStep['state'] = 'pending';
    if (index < currentIndex) {
      state = 'completed';
    } else if (index === currentIndex) {
      state = 'current';
    }

    return {
      key: step.key,
      title: step.title,
      description: step.description,
      state,
    };
  });

  const openMaps = () => {};
  const contactProvider = () => {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <Title>Provider assigned</Title>
          <Badge variant="neutral">{job.statusLabel}</Badge>
        </View>

        <ProviderInfoCard
          name={job.provider.name}
          rating={job.provider.rating}
          etaLabel={job.etaLabel}
          vehicle={job.provider.vehicle}
          plate={job.provider.plate}
        />

        <View className="mt-3 flex-row gap-3">
          <Button
            variant="subtle"
            size="md"
            className="flex-1"
            testID="pub.order.openMaps"
            onPress={openMaps}
          >
            Open maps
          </Button>
          <Button
            variant="subtle"
            size="md"
            className="flex-1"
            testID="pub.order.contactProvider"
            onPress={contactProvider}
          >
            Contact
          </Button>
        </View>

        <View className="mt-6 flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Status</Text>
          <PublicJobTimeline steps={steps} />
        </View>
      </View>

      <StickyFooter testID="pub.stickyFooter">
        <Link href="./rate" asChild>
          <Button
            variant="primary"
            testID="pub.order.markComplete"
            className="w-full"
            disabled={!job.canMarkComplete}
          >
            Mark complete
          </Button>
        </Link>
      </StickyFooter>
    </SafeAreaView>
  );
}
