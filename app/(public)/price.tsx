import { SERVICE_PRICING } from '@/constants/pricing';
import {
  calcTotal,
  useCheckoutStore,
  type Addon,
  type Service,
  type TimeInfo,
  type Vehicle,
} from '@/lib/public/checkoutStore';
import { useOrdersStore, type PublicOrder } from '@/lib/public/ordersStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewSection from '@/components/public/ReviewSection';
import PriceRow from '@/components/public/PriceRow';
import TotalPill from '@/components/public/TotalPill';
import { AppButton as Button } from '../../components/ui/Button';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';

const FALLBACK_ORDER: {
  service: Service;
  addons: Addon[];
  address: string;
  time: TimeInfo;
  payment: string;
  vehicle: Vehicle;
} = {
  service: {
    id: 'deep',
    title: 'Deep Cleaning',
    price: SERVICE_PRICING.deep.price,
    durationMin: SERVICE_PRICING.deep.duration,
  },
  addons: [],
  address: 'Home - 123 Residence Street',
  time: {
    fallbackLabel: 'Today, 2:00 PM - 3:30 PM',
  },
  payment: 'Cash on completion',
  vehicle: {
    makeModel: 'Toyota Camry',
    plate: 'ABC-123',
  },
};

export default function PriceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const storeState = useCheckoutStore();
  const addActiveOrder = useOrdersStore((state) => state.addActive);

  const { service, addons, address, vehicle, time, payment, clearOrder } = storeState;

  const resolvedService = service ?? FALLBACK_ORDER.service;
  const resolvedAddons = addons.length ? addons : FALLBACK_ORDER.addons;
  const resolvedAddress = address ?? FALLBACK_ORDER.address;
  const resolvedPayment = payment ?? FALLBACK_ORDER.payment;
  const resolvedVehicle = vehicle ?? FALLBACK_ORDER.vehicle;

  const totalFromStore = calcTotal(storeState);
  const fallbackTotal = calcTotal(FALLBACK_ORDER);
  const hasPricedStoreData = Boolean(service || addons.length);
  const resolvedTotal = hasPricedStoreData ? totalFromStore : fallbackTotal;

  const notes = typeof params.notes === 'string' ? params.notes : undefined;

  const formatTimeSlot = () => {
    if (time) {
      const { whenLabel, slotStart, slotEnd, fallbackLabel } = time;

      if (whenLabel && slotStart && slotEnd) {
        return `${whenLabel}, ${slotStart} - ${slotEnd}`;
      }

      if (slotStart && slotEnd) {
        return `${slotStart} - ${slotEnd}`;
      }

      if (whenLabel) {
        return whenLabel;
      }

      if (fallbackLabel) {
        return fallbackLabel;
      }
    }

    if (params.when === 'now') {
      return 'Now';
    }

    if (params.when === 'schedule' && params.slotStart) {
      const startTime = new Date(params.slotStart as string);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };

      const startTimeStr = startTime.toLocaleTimeString('en-US', timeOptions);
      const endTimeStr = endTime.toLocaleTimeString('en-US', timeOptions);

      return `Today, ${startTimeStr} - ${endTimeStr}`;
    }

    return FALLBACK_ORDER.time.fallbackLabel ?? 'Today';
  };

  const showVehicleRow = Boolean(resolvedVehicle?.makeModel || resolvedVehicle?.plate);

  const handleConfirm = () => {
    const now = Date.now();
    const orderId = now.toString();
    const fallbackAddress = 'Address not provided';
    const fallbackWhenLabel =
      FALLBACK_ORDER.time.whenLabel ?? FALLBACK_ORDER.time.fallbackLabel ?? 'Today';

    const whenLabel =
      time?.whenLabel ??
      (typeof params.when === 'string'
        ? params.when === 'now'
          ? 'Now'
          : fallbackWhenLabel
        : undefined) ??
      fallbackWhenLabel;
    const slotStart = time?.slotStart ?? (typeof params.slotStart === 'string' ? params.slotStart : undefined);
    const slotEnd = time?.slotEnd ?? (typeof params.slotEnd === 'string' ? params.slotEnd : undefined);

    const order: PublicOrder = {
      id: orderId,
      status: 'active',
      serviceTitle: resolvedService.title,
      price: resolvedTotal,
      durationMin: resolvedService.durationMin,
      address: address ?? fallbackAddress,
      vehicle: vehicle
        ? {
            makeModel: vehicle.makeModel,
            plate: vehicle.plate,
          }
        : undefined,
      whenLabel,
      slotStart,
      slotEnd,
      createdAt: now,
    };

    addActiveOrder(order);
    clearOrder();
    router.push({ pathname: '/(public)/matching', params: { id: orderId } });
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
          <ReviewSection title="Service" testID="tid.public.price.section.service">
            <PriceRow
              label={resolvedService.title}
              secondary={`${resolvedService.durationMin} minutes`}
              amountMAD={resolvedService.price}
              testID="pub.review.service.price"
            />
            <Text className="sr-only" testID="pub.review.service.name">
              {resolvedService.title}
            </Text>
            <Text className="sr-only" testID="pub.review.service.duration">
              {resolvedService.durationMin} minutes
            </Text>
          </ReviewSection>

          <ReviewSection title="Add-ons" testID="tid.public.price.section.addons">
            {resolvedAddons.length ? (
              <View className="flex-row flex-wrap gap-2">
                {resolvedAddons.map((addon) => (
                  <View
                    key={addon.id}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1"
                    testID={`tid.public.price.addon-chip-${addon.id}`}
                  >
                    <Text>{addon.label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500" testID="pub.review.addons.none">
                No add-ons selected
              </Text>
            )}
          </ReviewSection>

          <ReviewSection title="Details" testID="tid.public.price.section.details">
            <View className="flex-row items-start gap-2">
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Address</Text>
                <Text className="text-gray-800" testID="pub.review.details.address">
                  {resolvedAddress}
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Time Slot</Text>
                <Text className="text-gray-800" testID="pub.review.details.time">
                  {formatTimeSlot()}
                </Text>
              </View>
            </View>
            {!!notes && (
              <View className="flex-row items-start gap-2">
                <Ionicons name="document-text-outline" size={16} color="#6b7280" />
                <Text className="flex-1 text-gray-800" testID="pub.review.details.notes">
                  {notes}
                </Text>
              </View>
            )}
            {showVehicleRow && (
              <View className="flex-row items-start gap-2">
                <Ionicons name="car-outline" size={16} color="#6b7280" />
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">Vehicle</Text>
                  <Text className="text-gray-800" testID="pub.review.details.vehicle">
                    {resolvedVehicle?.makeModel ?? 'N/A'}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-500">Plate</Text>
                  <Text className="text-gray-800" testID="pub.review.details.plate">
                    {resolvedVehicle?.plate ?? 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </ReviewSection>

          <ReviewSection title="Payment" testID="tid.public.price.section.payment">
            <View className="flex-row items-center gap-2">
              <Ionicons name="cash-outline" size={18} color="#6b7280" />
              <Text className="text-gray-800" testID="pub.review.payment.cash">
                {resolvedPayment}
              </Text>
            </View>
          </ReviewSection>
        </View>
      </ScrollView>

      <StickyFooter>
        <View className="mb-3" testID="tid.public.price.total">
          <TotalPill totalMAD={resolvedTotal} durationMins={resolvedService.durationMin} />
        </View>
        <Button variant="primary" testID="tid.public.price.confirm" className="w-full" onPress={handleConfirm}>
          Confirm Order
        </Button>
      </StickyFooter>
    </SafeAreaView>
  );
}

