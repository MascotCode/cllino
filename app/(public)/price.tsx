import { SERVICE_PRICING } from '@/constants/pricing';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewSection from '@/components/public/ReviewSection';
import PriceRow from '@/components/public/PriceRow';
import TotalPill from '@/components/public/TotalPill';
import { AppButton as Button } from '../../components/ui/Button';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';

const ORDER_SUMMARY = {
  service: {
    id: 'deep',
    name: 'Deep Cleaning',
    ...SERVICE_PRICING.deep
  },
  addons: [] as Array<{ slug: string; label: string; price: number }>,
  address: 'Home - 123 Residence Street',
  timeSlot: 'Today, 2:00 PM - 3:30 PM',
  payment: 'Cash on completion',
  notes: undefined as string | undefined
};

export default function PriceScreen() {
  const params = useLocalSearchParams();
  const total = ORDER_SUMMARY.service.price;
  const addons = ORDER_SUMMARY.addons;
  const notes = ORDER_SUMMARY.notes;

  const formatTimeSlot = () => {
    if (params.when === 'now') {
      return 'Now';
    }

    if (params.when === 'schedule' && params.slotStart) {
      const startTime = new Date(params.slotStart as string);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };

      const startTimeStr = startTime.toLocaleTimeString('en-US', timeOptions);
      const endTimeStr = endTime.toLocaleTimeString('en-US', timeOptions);

      return `Today, ${startTimeStr} - ${endTimeStr}`;
    }

    return ORDER_SUMMARY.timeSlot;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Title>Review Order</Title>
        <Text className="mt-1 text-[11px] text-gray-400">rev: v-polish</Text>

        <View className="mt-6">
          <ReviewSection title="Service" testID="pub.review.section.service">
            <PriceRow
              label={ORDER_SUMMARY.service.name}
              secondary={`${ORDER_SUMMARY.service.duration} minutes`}
              amountMAD={ORDER_SUMMARY.service.price}
              testID="pub.review.service.price"
            />
            <Text className="sr-only" testID="pub.review.service.name">
              {ORDER_SUMMARY.service.name}
            </Text>
            <Text className="sr-only" testID="pub.review.service.duration">
              {ORDER_SUMMARY.service.duration} minutes
            </Text>
          </ReviewSection>

          <ReviewSection title="Add-ons" testID="pub.review.section.addons">
            {addons?.length ? (
              <View className="flex-row flex-wrap gap-2">
                {addons.map(addon => (
                  <View
                    key={addon.slug}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1"
                  >
                    <Text testID={`pub.review.addons.chip-${addon.slug}`}>{addon.label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500" testID="pub.review.addons.none">
                No add-ons selected
              </Text>
            )}
          </ReviewSection>

          <ReviewSection title="Details" testID="pub.review.section.details">
            <View className="flex-row items-start gap-2">
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text className="flex-1 text-gray-800" testID="pub.review.details.address">
                {ORDER_SUMMARY.address}
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="flex-1 text-gray-800" testID="pub.review.details.time">
                {formatTimeSlot()}
              </Text>
            </View>
            {!!notes && (
              <View className="flex-row items-start gap-2">
                <Ionicons name="document-text-outline" size={16} color="#6b7280" />
                <Text className="flex-1 text-gray-800" testID="pub.review.details.notes">
                  {notes}
                </Text>
              </View>
            )}
          </ReviewSection>

          <ReviewSection title="Payment" testID="pub.review.section.payment">
            <View className="flex-row items-center gap-2">
              <Ionicons name="cash-outline" size={18} color="#6b7280" />
              <Text className="text-gray-800" testID="pub.review.payment.cash">
                Cash on completion
              </Text>
            </View>
          </ReviewSection>
        </View>
      </ScrollView>

      <StickyFooter>
        <View className="mb-3">
          <TotalPill totalMAD={total} durationMins={ORDER_SUMMARY.service.duration} />
        </View>
        <Link href="./matching" asChild>
          <Button variant="primary" testID="pub.review.confirm" className="w-full">
            Confirm Order
          </Button>
        </Link>
      </StickyFooter>
    </SafeAreaView>
  );
}
