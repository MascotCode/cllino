import { CAR_SIZE_SURCHARGES, SERVICE_PRICING, type CarSize, type ServiceId } from '@/constants/pricing';
import { useCheckoutStore, type CheckoutState } from '@/lib/public/checkoutStore';
import { reverseGeocode } from '@/utils/geocode';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { computePricing, type PricingInputs, type PricingBreakdown } from '@/utils/pricing';

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type PublicServiceOption = {
  id: ServiceId;
  title: string;
  description: string;
  price: number;
  duration: number;
};

export type PublicCarSizeOption = {
  id: CarSize;
  label: string;
  surcharge: number;
};

export type PublicIndexSummary = {
  addressLabel: string;
  addressCoords: GeoPoint | null;
  services: PublicServiceOption[];
  carSizes: PublicCarSizeOption[];
  selectedServiceId: ServiceId | null;
  vehicleCount: number;
  carSize: CarSize;
};

export type PublicIndexTrackEvent = {
  name: string;
  metadata?: Record<string, unknown>;
};

export type PublicIndexRepo = {
  loadSummary: () => Promise<PublicIndexSummary>;
  refresh: () => Promise<PublicIndexSummary>;
  computePricing: (input: PricingInputs) => PricingBreakdown;
  persistCheckout: (payload: Partial<CheckoutState>) => void;
  reverseGeocode: (point: GeoPoint) => Promise<string>;
  ensureLocationServicesEnabled: () => Promise<boolean>;
  requestCurrentPosition: () => Promise<GeoPoint>;
  openPlatformSettings: () => Promise<void>;
  subscribeToAddress: (
    listener: (snapshot: { address: string | null; addressCoords: GeoPoint | null }) => void
  ) => () => void;
  track: (event: PublicIndexTrackEvent) => void;
};

type CreatePublicIndexRepoDeps = {
  store: typeof useCheckoutStore;
  locationModule: typeof Location;
  intentLauncher: typeof IntentLauncher;
  linking: typeof Linking;
  geocode: typeof reverseGeocode;
  pricing: typeof computePricing;
  onTrack?: (event: PublicIndexTrackEvent) => void;
};

const SERVICES: PublicServiceOption[] = [
  {
    id: 'basic',
    title: 'Basic Cleaning',
    description: 'Essential wash & dry for your vehicle',
    price: SERVICE_PRICING.basic.price,
    duration: SERVICE_PRICING.basic.duration,
  },
  {
    id: 'deep',
    title: 'Deep Cleaning',
    description: 'Thorough interior & exterior detailing',
    price: SERVICE_PRICING.deep.price,
    duration: SERVICE_PRICING.deep.duration,
  },
  {
    id: 'interior',
    title: 'Interior Detailing',
    description: 'Complete interior restoration',
    price: SERVICE_PRICING.interior.price,
    duration: SERVICE_PRICING.interior.duration,
  },
  {
    id: 'premium',
    title: 'Premium Package',
    description: 'Full service with wax & protection',
    price: SERVICE_PRICING.premium.price,
    duration: SERVICE_PRICING.premium.duration,
  },
];

const CAR_SIZES: PublicCarSizeOption[] = [
  { id: 'compact', label: 'Compact', surcharge: CAR_SIZE_SURCHARGES.compact },
  { id: 'suv', label: 'SUV', surcharge: CAR_SIZE_SURCHARGES.suv },
  { id: 'van', label: 'Van', surcharge: CAR_SIZE_SURCHARGES.van },
];

const DEFAULT_SUMMARY: Omit<PublicIndexSummary, 'addressLabel' | 'addressCoords'> = {
  services: SERVICES,
  carSizes: CAR_SIZES,
  selectedServiceId: null,
  vehicleCount: 1,
  carSize: 'compact',
};

const getAccuracyOption = (
  locationModule: typeof Location
): Parameters<typeof Location.getCurrentPositionAsync>[0] => {
  const accuracy = locationModule.Accuracy?.Highest ?? undefined;
  return {
    accuracy,
    mayShowUserSettingsDialog: true,
  };
};

export const createPublicIndexRepo = ({
  store,
  locationModule,
  intentLauncher,
  linking,
  geocode,
  pricing,
  onTrack,
}: CreatePublicIndexRepoDeps): PublicIndexRepo => {
  const loadSummary = async (): Promise<PublicIndexSummary> => {
    const snapshot = store.getState();
    const addressLabel = snapshot.address ?? 'Set pickup location';
    const coords = snapshot.addressCoords?.lat && snapshot.addressCoords?.lng
      ? {
          latitude: snapshot.addressCoords.lat,
          longitude: snapshot.addressCoords.lng,
        }
      : null;

    return {
      addressLabel,
      addressCoords: coords,
      ...DEFAULT_SUMMARY,
    };
  };

  const ensureLocationServicesEnabled = async (): Promise<boolean> => {
    const enabled = await locationModule.hasServicesEnabledAsync();
    if (enabled) return true;

    if (Platform.OS === 'android') {
      await intentLauncher.startActivityAsync(
        intentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
      );
      return false;
    }

    if (linking.openSettings) {
      await linking.openSettings();
    }
    return false;
  };

  const requestCurrentPosition = async (): Promise<GeoPoint> => {
    const response = await locationModule.requestForegroundPermissionsAsync();
    if (response.status !== 'granted') {
      throw new Error('permission-denied');
    }

    const options = getAccuracyOption(locationModule);
    const position = await locationModule.getCurrentPositionAsync(options);

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  };

  const reverseGeocodePoint = async (point: GeoPoint): Promise<string> => {
    const result = await geocode(point.latitude, point.longitude);
    if (!result.title) {
      return 'Current location';
    }
    return result.subtitle ? [result.title, result.subtitle].join(', ') : result.title;
  };

  const persistCheckout = (payload: Partial<CheckoutState>) => {
    store.getState().setOrder(payload);
  };

  const computePricingSafe = (input: PricingInputs): PricingBreakdown => {
    return pricing(input);
  };

  const track = (event: PublicIndexTrackEvent) => {
    if (onTrack) {
      onTrack(event);
    } else {
      console.log('[PublicIndex]', event.name, event.metadata ?? {});
    }
  };

  const subscribeToAddress = (
    listener: (snapshot: { address: string | null; addressCoords: GeoPoint | null }) => void
  ) => {
    const select = (state: CheckoutState) => ({
      address: state.address,
      addressCoords: state.addressCoords,
    });

    const unsubscribe = store.subscribe(select, (current, previous) => {
      const coordsEqual = (a: CheckoutState['addressCoords'], b: CheckoutState['addressCoords']) => {
        if (!a || !b) return !a && !b;
        return a.lat === b.lat && a.lng === b.lng;
      };

      if (current.address === previous.address && coordsEqual(current.addressCoords, previous.addressCoords)) {
        return;
      }

      listener({
        address: current.address ?? null,
        addressCoords:
          current.addressCoords?.lat !== undefined && current.addressCoords?.lng !== undefined
            ? {
                latitude: current.addressCoords.lat,
                longitude: current.addressCoords.lng,
              }
            : null,
      });
    });

    return unsubscribe;
  };

  return {
    loadSummary,
    refresh: loadSummary,
    computePricing: computePricingSafe,
    persistCheckout,
    reverseGeocode: reverseGeocodePoint,
    ensureLocationServicesEnabled,
    requestCurrentPosition,
    openPlatformSettings: async () => {
      if (Platform.OS === 'android') {
        await intentLauncher.startActivityAsync(
          intentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS
        );
        return;
      }
      if (linking.openSettings) {
        await linking.openSettings();
      }
    },
    subscribeToAddress,
    track,
  };
};

export const publicIndexRepo = createPublicIndexRepo({
  store: useCheckoutStore,
  locationModule: Location,
  intentLauncher: IntentLauncher,
  linking: Linking,
  geocode: reverseGeocode,
  pricing: computePricing,
});
