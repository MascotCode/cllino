import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { AccessibilityInfo, Alert, Platform } from 'react-native';
import type BottomSheet from '@gorhom/bottom-sheet';
import type MapView from 'react-native-maps';
import type { Camera, Region } from 'react-native-maps';
import type { Place } from '@/types/places';
import {
  publicIndexRepo,
  type PublicIndexRepo,
  type GeoPoint,
  type PublicServiceOption,
  type PublicCarSizeOption,
  type PublicIndexSummary,
} from '../services/publicIndex.repo';
import type { PricingBreakdown } from '@/utils/pricing';

type SheetView = 'services' | 'car-selection';

type ContinueParams = {
  serviceId: PublicServiceOption['id'];
  carSize: PublicCarSizeOption['id'];
  vehicleCount: number;
  priceTotal: number;
  breakdown: PricingBreakdown;
};

type UsePublicIndexOptions = {
  repo?: PublicIndexRepo;
  onOpenAddressSelect?: () => void;
  onOpenMapSelect?: () => void;
  onNavigateToTime?: (params: ContinueParams) => void;
};

type UsePublicIndexResult = {
  loading: boolean;
  error: Error | null;
  mapRef: MutableRefObject<MapView | null>;
  sheetRef: MutableRefObject<BottomSheet | null>;
  addressLabel: string;
  coords: GeoPoint | null;
  initialRegion: Region;
  snapPoints: readonly string[];
  sheetView: SheetView;
  services: PublicServiceOption[];
  carSizes: PublicCarSizeOption[];
  selectedService: PublicServiceOption | null;
  carSize: PublicCarSizeOption['id'];
  vehicleCount: number;
  priceTotal: number;
  breakdown: PricingBreakdown | null;
  showSoftCap: boolean;
  showMinWarning: boolean;
  pendingAbsMax: number | null;
  effectiveAbsMax: number;
  userEditedPrice: boolean;
  refresh: () => Promise<void>;
  onPressSearch: () => void;
  onPressChooseOnMap: () => void;
  onUseMyLocation: () => Promise<void>;
  onSelectPlace: (place: Place) => void;
  onRegionChangeComplete: (region: Region) => void;
  onMapGestureStart: () => void;
  onMapGestureEnd: () => void;
  onSelectService: (service: PublicServiceOption) => void;
  onBackToServices: () => void;
  onChangeCarSize: (size: PublicCarSizeOption['id']) => void;
  onChangeVehicleCount: (count: number) => void;
  onChangePrice: (next: number) => void;
  onClampMinPrice: () => void;
  onExceedAbsMax: (next: number) => void;
  onConfirmHighPrice: () => void;
  onCancelHighPrice: () => void;
  onContinue: () => void;
};

const GEOCODE_DEBOUNCE_MS = 400;
const DISTANCE_THRESHOLD_METERS = 30;

const INITIAL_REGION: Region = {
  latitude: 33.5731,
  longitude: -7.5898,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const roundToStep = (value: number, step: number): number => {
  return Math.round(value / step) * step;
};

const toastOnce = (() => {
  let shown = false;
  return (message: string) => {
    if (shown) return;
    shown = true;
    console.log('[PublicIndex toast]', message);
  };
})();

const haversineDistance = (
  a: GeoPoint,
  b: GeoPoint
): number => {
  const R = 6371000;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLng = ((b.longitude - a.longitude) * Math.PI) / 180;

  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const root =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(root), Math.sqrt(1 - root));
  return R * c;
};

export const usePublicIndex = (
  options?: UsePublicIndexOptions
): UsePublicIndexResult => {
  const repo = options?.repo ?? publicIndexRepo;
  const onOpenAddressSelect = options?.onOpenAddressSelect;
  const onOpenMapSelect = options?.onOpenMapSelect;
  const onNavigateToTime = options?.onNavigateToTime;

  const mapRef = useRef<MapView | null>(null);
  const sheetRef = useRef<BottomSheet | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeocodedRef = useRef<GeoPoint | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetHiddenRef = useRef(false);
  const storeCoordsRef = useRef<GeoPoint | null>(null);
  const isStoreUpdateFromMapRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<PublicIndexSummary | null>(null);
  const [addressLabel, setAddressLabel] = useState('Set pickup location');
  const [coords, setCoords] = useState<GeoPoint | null>(null);
  const [sheetView, setSheetView] = useState<SheetView>('services');
  const [selectedServiceId, setSelectedServiceId] = useState<PublicServiceOption['id'] | null>(null);
  const [carSize, setCarSize] = useState<PublicCarSizeOption['id']>('compact');
  const [vehicleCount, setVehicleCount] = useState(1);
  const [userEditedPrice, setUserEditedPrice] = useState(false);
  const [priceTotal, setPriceTotal] = useState(0);
  const [showSoftCap, setShowSoftCap] = useState(false);
  const [pendingAbsMax, setPendingAbsMax] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [showMinWarning, setShowMinWarning] = useState(false);
  const [effectiveAbsMax, setEffectiveAbsMax] = useState(0);

  const snapPoints = useMemo(() => ['45%'] as const, []);

  const services = summary?.services ?? [];
  const carSizes = summary?.carSizes ?? [];

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((svc) => svc.id === selectedServiceId) ?? null;
  }, [selectedServiceId, services]);

  const carSizeOption = useMemo(() => {
    return carSizes.find((size) => size.id === carSize) ?? carSizes[0] ?? null;
  }, [carSizes, carSize]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await repo.loadSummary();
      setSummary(result);
      setAddressLabel(result.addressLabel);
      setCoords(result.addressCoords);
      setCarSize(result.carSize);
      setVehicleCount(result.vehicleCount);
      setSelectedServiceId(result.selectedServiceId);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error('Failed to load public index');
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    let mounted = true;
    refresh().catch((err) => {
      if (!mounted) return;
      const nextError = err instanceof Error ? err : new Error('Failed to load public index');
      setError(nextError);
      setLoading(false);
    });
    return () => {
      mounted = false;
      if (geocodeTimerRef.current) {
        clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = null;
      }
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (showTimer.current) {
        clearTimeout(showTimer.current);
        showTimer.current = null;
      }
    };
  }, [refresh]);

  useEffect(() => {
    if (!selectedService) return;

    const nextBreakdown = repo.computePricing({
      serviceId: selectedService.id,
      carSize,
      vehicleCount,
    });

    setBreakdown(nextBreakdown);
    setEffectiveAbsMax(nextBreakdown.absMaxTotal);

    setPriceTotal((prev) => {
      const base = userEditedPrice ? prev : nextBreakdown.fairTotal;
      const clamped = clamp(roundToStep(base, 5), nextBreakdown.minTotal, nextBreakdown.absMaxTotal);
      return clamped;
    });
  }, [repo, selectedService, carSize, vehicleCount, userEditedPrice]);

  useEffect(() => {
    if (!breakdown) return;
    setShowSoftCap(priceTotal > breakdown.typicalMaxTotal);
    setShowMinWarning(priceTotal === breakdown.minTotal);
  }, [priceTotal, breakdown]);

  useEffect(() => {
    const unsubscribe = repo.subscribeToAddress(({ address, addressCoords }) => {
      const nextLabel = address ?? 'Set pickup location';
      setAddressLabel(nextLabel);

      if (!addressCoords) {
        storeCoordsRef.current = null;
        setCoords(null);
        return;
      }

      setCoords(addressCoords);

      if (isStoreUpdateFromMapRef.current) {
        storeCoordsRef.current = addressCoords;
        return;
      }

      const prev = storeCoordsRef.current;
      const changed =
        !prev ||
        prev.latitude !== addressCoords.latitude ||
        prev.longitude !== addressCoords.longitude;

      storeCoordsRef.current = addressCoords;

      if (changed) {
        mapRef.current?.animateToRegion(
          {
            latitude: addressCoords.latitude,
            longitude: addressCoords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    });

    return unsubscribe;
  }, [repo]);

  const hideSheet = useCallback((delay = 0) => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      if (sheetHiddenRef.current) return;
      sheetRef.current?.close();
      sheetHiddenRef.current = true;
    }, delay);
  }, []);

  const showSheet = useCallback((delay = 250) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (showTimer.current) {
      clearTimeout(showTimer.current);
    }
    showTimer.current = setTimeout(() => {
      if (!sheetHiddenRef.current) return;
      sheetRef.current?.snapToIndex(0);
      sheetHiddenRef.current = false;
    }, delay);
  }, []);

  const performReverseGeocode = useCallback(async (point: GeoPoint) => {
    if (lastGeocodedRef.current) {
      const distance = haversineDistance(lastGeocodedRef.current, point);
      if (distance < DISTANCE_THRESHOLD_METERS) {
        return;
      }
    }
    lastGeocodedRef.current = point;
    try {
      const label = await repo.reverseGeocode(point);
      setAddressLabel(label || 'Current location');
      AccessibilityInfo.announceForAccessibility?.('Updated address to ' + label);
      isStoreUpdateFromMapRef.current = true;
      try {
        repo.persistCheckout({
          address: label,
          addressCoords: { label, lat: point.latitude, lng: point.longitude },
        });
      } finally {
        isStoreUpdateFromMapRef.current = false;
      }
    } catch (err) {
      console.warn('reverse geocode failed', err);
    }
  }, [repo]);

  const scheduleGeocode = useCallback((point: GeoPoint) => {
    if (geocodeTimerRef.current) {
      clearTimeout(geocodeTimerRef.current);
    }
    geocodeTimerRef.current = setTimeout(() => {
      performReverseGeocode(point).catch((err) => console.warn('reverse geocode error', err));
    }, GEOCODE_DEBOUNCE_MS);
  }, [performReverseGeocode]);

  const onRegionChangeComplete = useCallback((region: Region) => {
    showSheet(0);
    scheduleGeocode({ latitude: region.latitude, longitude: region.longitude });
  }, [scheduleGeocode, showSheet]);

  const onMapGestureStart = useCallback(() => {
    hideSheet(0);
  }, [hideSheet]);

  const onMapGestureEnd = useCallback(() => {
    showSheet(200);
  }, [showSheet]);

  const onPressSearch = useCallback(() => {
    onOpenAddressSelect?.();
  }, [onOpenAddressSelect]);

  const onPressChooseOnMap = useCallback(() => {
    onOpenMapSelect?.();
  }, [onOpenMapSelect]);

  const onSelectPlace = useCallback((place: Place) => {
    setAddressLabel(place.title);
    setCoords({ latitude: place.lat, longitude: place.lng });
    mapRef.current?.animateCamera(
      {
        center: { latitude: place.lat, longitude: place.lng },
        zoom: 15,
      } as Partial<Camera>,
      { duration: 600 }
    );
    sheetRef.current?.snapToIndex(0);
  }, []);

  useEffect(() => {
    if (!summary) return;
    if (summary.addressCoords) {
      setCoords(summary.addressCoords);
      storeCoordsRef.current = summary.addressCoords;
      mapRef.current?.animateToRegion(
        {
          latitude: summary.addressCoords.latitude,
          longitude: summary.addressCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    } else {
      storeCoordsRef.current = null;
      setCoords(null);
    }
  }, [summary]);

  const ensureLocation = useCallback(async () => {
    const enabled = await repo.ensureLocationServicesEnabled();
    return enabled;
  }, [repo]);

  const onUseMyLocation = useCallback(async () => {
    try {
      const enabled = await ensureLocation();
      if (!enabled) return;

      const position = await repo.requestCurrentPosition();
      setCoords(position);
      scheduleGeocode(position);
      mapRef.current?.animateToRegion(
        {
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
      sheetRef.current?.snapToIndex(0);
    } catch (err) {
      if (err instanceof Error && err.message === 'permission-denied') {
        Alert.alert('Permission needed', 'We need location permission to set your pickup point.');
        return;
      }
      console.warn('use location error', err);
      Alert.alert('Location error', 'Could not get your current position.');
    }
  }, [ensureLocation, scheduleGeocode]);

  const onSelectService = useCallback((service: PublicServiceOption) => {
    setSelectedServiceId(service.id);
    setUserEditedPrice(false);
    setSheetView('car-selection');
  }, []);

  const onBackToServices = useCallback(() => {
    setSheetView('services');
    setSelectedServiceId(null);
  }, []);

  const onChangeCarSize = useCallback((size: PublicCarSizeOption['id']) => {
    setCarSize(size);
    setUserEditedPrice(false);
  }, []);

  const onChangeVehicleCount = useCallback((count: number) => {
    const clamped = Math.max(1, Math.min(5, count));
    setVehicleCount(clamped);
    setUserEditedPrice(false);
  }, []);

  const onChangePrice = useCallback((next: number) => {
    setUserEditedPrice(true);
    setPriceTotal(next);
  }, []);

  const onClampMinPrice = useCallback(() => {
    toastOnce('That is the minimum for this service.');
  }, []);

  const onExceedAbsMax = useCallback((next: number) => {
    setPendingAbsMax(next);
  }, []);

  const onConfirmHighPrice = useCallback(() => {
    if (pendingAbsMax === null || !breakdown) return;
    setPriceTotal(pendingAbsMax);
    setShowSoftCap(pendingAbsMax > breakdown.typicalMaxTotal);
    setEffectiveAbsMax(Math.max(effectiveAbsMax, pendingAbsMax + 50));
    setPendingAbsMax(null);
  }, [pendingAbsMax, breakdown, effectiveAbsMax]);

  const onCancelHighPrice = useCallback(() => {
    if (!breakdown) {
      setPendingAbsMax(null);
      return;
    }
    setPriceTotal(breakdown.typicalMaxTotal);
    setShowSoftCap(false);
    setPendingAbsMax(null);
  }, [breakdown]);

  const onContinue = useCallback(() => {
    if (!selectedService || !breakdown) return;

    const trimmedAddress = addressLabel && addressLabel !== 'Set pickup location' ? addressLabel : null;
    const vehicleLabel = carSizeOption ? carSizeOption.label : 'Vehicle';
    const countSuffix = vehicleCount > 1 ? ' x' + String(vehicleCount) : '';
    const makeModel = vehicleLabel + countSuffix;

    repo.persistCheckout({
      service: {
        id: selectedService.id,
        title: selectedService.title,
        price: priceTotal,
        durationMin: selectedService.duration,
      },
      addons: [],
      address: trimmedAddress,
      addressCoords: trimmedAddress
        ? {
            label: trimmedAddress,
            lat: coords?.latitude,
            lng: coords?.longitude,
          }
        : null,
      vehicle: carSizeOption
        ? {
            makeModel,
            plate: 'Pending',
          }
        : null,
      payment: 'Cash on completion',
      time: null,
    });

    repo.track({
      name: 'public_index_continue',
      metadata: {
        serviceId: selectedService.id,
        carSize,
        vehicleCount,
        priceTotal,
      },
    });

    onNavigateToTime?.({
      serviceId: selectedService.id,
      carSize,
      vehicleCount,
      priceTotal,
      breakdown,
    });
  }, [
    repo,
    selectedService,
    breakdown,
    addressLabel,
    carSizeOption,
    carSize,
    vehicleCount,
    priceTotal,
    coords,
    onNavigateToTime,
  ]);

  return {
    loading,
    error,
    mapRef,
    sheetRef,
    addressLabel,
    coords,
    initialRegion: INITIAL_REGION,
    snapPoints,
    sheetView,
    services,
    carSizes,
    selectedService,
    carSize,
    vehicleCount,
    priceTotal,
    breakdown,
    showSoftCap,
    showMinWarning,
    pendingAbsMax,
    effectiveAbsMax,
    userEditedPrice,
    refresh,
    onPressSearch,
    onPressChooseOnMap,
    onUseMyLocation,
    onSelectPlace,
    onRegionChangeComplete,
    onMapGestureStart,
    onMapGestureEnd,
    onSelectService,
    onBackToServices,
    onChangeCarSize,
    onChangeVehicleCount,
    onChangePrice,
    onClampMinPrice,
    onExceedAbsMax,
    onConfirmHighPrice,
    onCancelHighPrice,
    onContinue,
  };
};

export type { UsePublicIndexOptions, UsePublicIndexResult, SheetView };
