import { render, fireEvent } from '@testing-library/react-native';
import React, { type Ref } from 'react';
import { PublicIndex } from '../containers/PublicIndex';
import type { UsePublicIndexResult } from '../hooks/usePublicIndex';
import { usePublicIndex } from '../hooks/usePublicIndex';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Map = React.forwardRef((props: any, ref: Ref<any>) => <View {...props} ref={ref} />);
  const Marker = (props: any) => <View {...props} />;
  return {
    __esModule: true,
    default: Map,
    Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View, ScrollView } = require('react-native');
  const Sheet = React.forwardRef((props: any, ref: Ref<any>) => <View {...props} ref={ref} />);
  const SheetScrollView = (props: any) => <ScrollView {...props} />;
  return {
    __esModule: true,
    default: Sheet,
    BottomSheetScrollView: SheetScrollView,
  };
});

jest.mock('@/components/ui/AmountInput', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  const AmountInput = ({ value, onChange, testID }: any) => (
    <Pressable onPress={() => onChange(value)} testID={testID}>
      <Text>{value}</Text>
    </Pressable>
  );
  return {
    __esModule: true,
    default: AmountInput,
  };
});

jest.mock('../hooks/usePublicIndex');

const mockUsePublicIndex = usePublicIndex as jest.MockedFunction<typeof usePublicIndex>;

const baseRegion = {
  latitude: 33.5,
  longitude: -7.6,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const createResult = (overrides: Partial<UsePublicIndexResult> = {}): UsePublicIndexResult => ({
  loading: false,
  error: null,
  mapRef: { current: null },
  sheetRef: { current: null },
  addressLabel: 'Set pickup location',
  coords: null,
  initialRegion: baseRegion,
  snapPoints: ['45%'],
  sheetView: 'services',
  services: [],
  carSizes: [
    { id: 'compact', label: 'Compact', surcharge: 0 },
    { id: 'suv', label: 'SUV', surcharge: 30 },
  ],
  selectedService: null,
  carSize: 'compact',
  vehicleCount: 1,
  priceTotal: 120,
  breakdown: null,
  showSoftCap: false,
  showMinWarning: false,
  pendingAbsMax: null,
  effectiveAbsMax: 200,
  userEditedPrice: false,
  refresh: jest.fn(),
  onPressSearch: jest.fn(),
  onPressChooseOnMap: jest.fn(),
  onUseMyLocation: jest.fn(),
  onSelectPlace: jest.fn(),
  onRegionChangeComplete: jest.fn(),
  onMapGestureStart: jest.fn(),
  onMapGestureEnd: jest.fn(),
  onSelectService: jest.fn(),
  onBackToServices: jest.fn(),
  onChangeCarSize: jest.fn(),
  onChangeVehicleCount: jest.fn(),
  onChangePrice: jest.fn(),
  onClampMinPrice: jest.fn(),
  onExceedAbsMax: jest.fn(),
  onConfirmHighPrice: jest.fn(),
  onCancelHighPrice: jest.fn(),
  onContinue: jest.fn(),
  ...overrides,
});

describe('PublicIndex container', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error state', () => {
    const refresh = jest.fn();
    mockUsePublicIndex.mockReturnValue(
      createResult({
        error: new Error('oh no'),
        refresh,
      })
    );

    const { getByTestId, getByLabelText } = render(<PublicIndex />);

    expect(getByTestId('public.index.error')).toBeTruthy();
    fireEvent.press(getByLabelText('Retry loading'));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('renders services list when data available', () => {
    mockUsePublicIndex.mockReturnValue(
      createResult({
        services: [
          { id: 'basic', title: 'Basic', description: 'Desc', price: 100, duration: 30 },
        ],
      })
    );

    const { getByTestId } = render(<PublicIndex />);

    expect(getByTestId('public.index.service.basic')).toBeTruthy();
  });

  it('renders empty state when no services', () => {
    mockUsePublicIndex.mockReturnValue(
      createResult({ services: [] })
    );

    const { getByTestId } = render(<PublicIndex />);

    expect(getByTestId('public.index.empty')).toBeTruthy();
  });

  it('enables footer and triggers continue in car selection view', () => {
    const onContinue = jest.fn();
    mockUsePublicIndex.mockReturnValue(
      createResult({
        sheetView: 'car-selection',
        selectedService: {
          id: 'basic',
          title: 'Basic',
          description: 'Desc',
          price: 100,
          duration: 30,
        },
        breakdown: {
          baseFloorPerCar: 100,
          sizeAdjPerCar: 0,
          distanceAdjPerCar: 0,
          minTotal: 100,
          typicalMaxTotal: 150,
          absMaxTotal: 250,
          fairTotal: 120,
        },
        onContinue,
      })
    );

    const { getByTestId } = render(<PublicIndex />);

    const footer = getByTestId('public.index.footer.primary');
    fireEvent.press(footer);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
