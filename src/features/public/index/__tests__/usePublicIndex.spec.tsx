jest.mock('expo-location', () => ({
  __esModule: true,
  hasServicesEnabledAsync: jest.fn(async () => true),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 0, longitude: 0 } })),
  Accuracy: { Highest: 5 },
}));

jest.mock('expo-intent-launcher', () => ({
  __esModule: true,
  ActivityAction: {
    LOCATION_SOURCE_SETTINGS: 'settings',
    APPLICATION_DETAILS_SETTINGS: 'application',
  },
  startActivityAsync: jest.fn(async () => {}),
}));

import { render, act, waitFor } from '@testing-library/react-native';
import { forwardRef, useImperativeHandle } from 'react';
import { usePublicIndex } from '../hooks/usePublicIndex';
import type { UsePublicIndexOptions, UsePublicIndexResult } from '../hooks/usePublicIndex';
import type { PublicIndexRepo, PublicIndexSummary } from '../services/publicIndex.repo';
import type { PricingBreakdown } from '@/utils/pricing';

const Harness = forwardRef<UsePublicIndexResult | null, UsePublicIndexOptions>(function Harness(props, ref) {
  const state = usePublicIndex(props);
  useImperativeHandle(ref, () => state, [state]);
  return null;
});

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

const createMockRepo = (): Mutable<PublicIndexRepo> => {
  const summary: PublicIndexSummary = {
    addressLabel: 'Set pickup location',
    addressCoords: { latitude: 33.5, longitude: -7.6 },
    services: [
      {
        id: 'basic',
        title: 'Basic Cleaning',
        description: 'Essential wash',
        price: 120,
        duration: 45,
      },
    ],
    carSizes: [
      { id: 'compact', label: 'Compact', surcharge: 0 },
      { id: 'suv', label: 'SUV', surcharge: 40 },
    ],
    selectedServiceId: 'basic',
    vehicleCount: 1,
    carSize: 'compact',
  };

  const breakdown: PricingBreakdown = {
    baseFloorPerCar: 100,
    sizeAdjPerCar: 0,
    distanceAdjPerCar: 0,
    minTotal: 100,
    typicalMaxTotal: 150,
    absMaxTotal: 250,
    fairTotal: 120,
  };

  return {
    loadSummary: jest.fn(async () => summary),
    refresh: jest.fn(async () => summary),
    computePricing: jest.fn(() => breakdown),
    persistCheckout: jest.fn(),
    reverseGeocode: jest.fn(async () => 'New label'),
    ensureLocationServicesEnabled: jest.fn(async () => true),
    requestCurrentPosition: jest.fn(async () => ({ latitude: 33.6, longitude: -7.7 })),
    openPlatformSettings: jest.fn(async () => {}),
    track: jest.fn(),
  };
};

describe('usePublicIndex', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('loads summary data and exposes services', async () => {
    const repo = createMockRepo();
    const ref = { current: null as UsePublicIndexResult | null };

    render(<Harness ref={ref as any} repo={repo} />);

    await waitFor(() => {
      expect(ref.current?.loading).toBe(false);
    });

    expect(repo.loadSummary).toHaveBeenCalledTimes(1);
    expect(ref.current?.services).toHaveLength(1);
    expect(ref.current?.addressLabel).toBe('Set pickup location');
  });

  it('requests current location and persists checkout', async () => {
    jest.useFakeTimers();
    const repo = createMockRepo();
    const ref = { current: null as UsePublicIndexResult | null };

    render(
      <Harness
        ref={ref as any}
        repo={repo}
        onOpenAddressSelect={jest.fn()}
        onOpenMapSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(ref.current?.loading).toBe(false);
    });

    await act(async () => {
      await ref.current?.onUseMyLocation();
    });

    act(() => {
      jest.advanceTimersByTime(450);
    });

    await waitFor(() => {
      expect(repo.reverseGeocode).toHaveBeenCalledTimes(1);
    });

    expect(repo.requestCurrentPosition).toHaveBeenCalledTimes(1);
    expect(repo.persistCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        addressCoords: expect.objectContaining({ lat: expect.any(Number), lng: expect.any(Number) }),
      })
    );
  });

  it('tracks continue action and calls navigation callback', async () => {
    const repo = createMockRepo();
    const onNavigate = jest.fn();
    const ref = { current: null as UsePublicIndexResult | null };

    render(
      <Harness
        ref={ref as any}
        repo={repo}
        onNavigateToTime={onNavigate}
      />
    );

    await waitFor(() => {
      expect(ref.current?.loading).toBe(false);
    });

    act(() => {
      ref.current?.onContinue();
    });

    expect(repo.persistCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        service: expect.objectContaining({ id: 'basic', price: expect.any(Number) }),
      })
    );
    expect(repo.track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'public_index_continue' })
    );
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: 'basic' })
    );
  });
});
