import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, Text, View } from 'react-native';
import MapView, { Camera, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import type { RouteEntryModalRef } from '../../components/search/RouteEntryModal';
import RouteEntryModal from '../../components/search/RouteEntryModal';
import type { Place } from '../../types/places';

// Tiny util to render money like "35 MAD"
const fmtMoney = (amount: number, currency = 'MAD') => `${amount} ${currency}`;

const SERVICES = [
  { id: 'basic', title: 'Basic Cleaning', desc: 'Essential wash & dry for your vehicle', price: 15, duration: 30, icon: (c='#2563eb') => <Ionicons name="car" size={20} color={c} /> },
  { id: 'deep', title: 'Deep Cleaning', desc: 'Thorough interior & exterior detailing', price: 35, duration: 90, icon: (c='#2563eb') => <MaterialIcons name="auto-fix-high" size={20} color={c} /> },
  { id: 'interior', title: 'Interior Detailing', desc: 'Complete interior restoration', price: 25, duration: 60, icon: (c='#2563eb') => <MaterialIcons name="corporate-fare" size={20} color={c} /> },
  { id: 'premium', title: 'Premium Package', desc: 'Full service with wax & protection', price: 55, duration: 120, icon: (c='#2563eb') => <MaterialIcons name="diamond" size={20} color={c} /> },
];

const CAR_SIZES = [
  { id: 'compact', label: 'Compact', surcharge: 0 },
  { id: 'suv', label: 'SUV', surcharge: 7 },
  { id: 'van', label: 'Van', surcharge: 12 },
];

type SheetView = 'services' | 'car-selection';

export default function ServiceHome() {
  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const routeModalRef = useRef<RouteEntryModalRef>(null);
  const snapPoints = useMemo(() => ['45%'], []); // Fixed single snap point
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressLabel, setAddressLabel] = useState<string>('Set pickup location');
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  
  // Car selection state
  const [sheetView, setSheetView] = useState<SheetView>('services');
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [selectedCarSize, setSelectedCarSize] = useState<string>('compact');
  const [vehicleQuantity, setVehicleQuantity] = useState<number>(1);

  const initialRegion: Region = {
    latitude: 33.5731, // Casablanca
    longitude: -7.5898,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const best = results?.[0];
      if (best) {
        const line = [best.name, best.street, best.city].filter(Boolean).join(', ');
        setAddressLabel(line || 'Current location');
      } else {
        setAddressLabel('Current location');
      }
    } catch {
      setAddressLabel('Current location');
    }
  };

  const ensureLocationServices = async () => {
    const on = await Location.hasServicesEnabledAsync();
    if (!on) {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
      } else {
        Alert.alert(
          'Location is off',
          'Turn on Location Services to use your current position.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
          ]
        );
      }
      return false;
    }
    return true;
  };

  const onUseMyLocation = async () => {
    try {
      const servicesOk = await ensureLocationServices();
      if (!servicesOk) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need location permission to set your pickup point.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        mayShowUserSettingsDialog: true,
      });

      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      await reverseGeocode(latitude, longitude);

      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        500
      );
      sheetRef.current?.snapToIndex(0);
    } catch (e) {
      console.warn('use-location error', e);
      Alert.alert('Location error', 'Could not get your current position.');
    }
  };

  const openRouteModal = () => routeModalRef.current?.open();

  const onSelectPlace = (place: Place) => {
    setAddressLabel(place.title);
    setCoords({ lat: place.lat, lng: place.lng });
    mapRef.current?.animateCamera({
      center: { latitude: place.lat, longitude: place.lng },
      zoom: 15,
    } as Partial<Camera>, { duration: 600 });
    sheetRef.current?.snapToIndex(0);
  };

  const onChooseOnMap = () => {
    // Toggle pin-choose mode - placeholder for future implementation
    console.log('Choose on map mode activated');
  };

  // Car selection handlers
  const onSelectService = (service: typeof SERVICES[0]) => {
    setSelectedService(service);
    setSheetView('car-selection');
  };

  const onBackToServices = () => {
    setSheetView('services');
    setSelectedService(null);
  };

  const calculatePrice = () => {
    if (!selectedService) return 0;
    const carSize = CAR_SIZES.find(size => size.id === selectedCarSize);
    const surcharge = carSize ? carSize.surcharge : 0;
    const perVehicle = selectedService.price + surcharge;
    return perVehicle * vehicleQuantity;
  };

  const onContinue = () => {
    if (!selectedService) return;
    const totalPrice = calculatePrice();
    const query = new URLSearchParams({
      serviceId: selectedService.id,
      carSize: selectedCarSize,
      quantity: vehicleQuantity.toString(),
      totalPrice: totalPrice.toString()
    });
    router.push(`./orders?${query.toString()}`);
  };

  // --- Drawer show/hide helpers (imperative + debounced)
  const isHiddenRef = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideSheet = (delay = 0) => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isHiddenRef.current) {
        sheetRef.current?.close(); // index -> -1
        isHiddenRef.current = true;
      }
    }, delay);
  };

  const showSheet = (delay = 250) => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    if (showTimer.current) clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => {
      if (isHiddenRef.current) {
        sheetRef.current?.snapToIndex(0); // back to our only snap point
        isHiddenRef.current = false;
      }
    }, delay);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Map */}
      <MapView
        ref={mapRef}
        testID="tid.home.map"
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        loadingEnabled
        onTouchStart={() => hideSheet(0)}
        onPanDrag={() => hideSheet(0)}
        onTouchEnd={() => showSheet(200)}
        onTouchCancel={() => showSheet(200)}
        onRegionChangeComplete={() => showSheet(0)}
      >
        {coords && (
          <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} />
        )}
      </MapView>

      {/* Floating Locate Me FAB - moved to top-right to avoid modal overlap */}
      <Pressable
        testID="tid.map.locateFab"
        onPress={onUseMyLocation}
        className="absolute top-24 right-4 w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-200 shadow-sm"
        style={{ zIndex: 30 }}
      >
        <Ionicons name="locate" size={20} color="#2563EB" />
      </Pressable>


      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={0} // visible by default
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        enableOverDrag={false}
        enableHandlePanningGesture={false}
        enableContentPanningGesture={true}
        handleStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <BottomSheetScrollView 
          testID="tid.home.sheet"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        >
          {sheetView === 'services' ? (
            <>
              {/* Search bar - tappable to open modal */}
              <Pressable
                onPress={openRouteModal}
                className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 active:opacity-80"
                testID="search-pill"
              >
                <Ionicons name="search" size={18} color="#6B7280" />
                <Text className="ml-2 flex-1 text-gray-900" numberOfLines={1}>
                  {addressLabel || 'Enter pickup or service location'}
                </Text>
              </Pressable>

              {/* Segment */}
              <View className="mt-4 flex-row bg-gray-100 p-1 rounded-full">
                <Pressable className="flex-1 bg-white rounded-full py-2 items-center">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="car" size={16} color="#2563eb" />
                    <Text className="text-sm font-semibold text-gray-900">Car Wash</Text>
                  </View>
                </Pressable>
                <Pressable className="flex-1 py-2 items-center opacity-50" disabled>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="bicycle" size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-600">Motorcycle</Text>
                  </View>
                </Pressable>
                <Pressable className="flex-1 py-2 items-center opacity-50" disabled>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="local-shipping" size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-600">Trucks</Text>
                  </View>
                </Pressable>
              </View>

              {/* Services */}
              <View className="mt-6 gap-3">
                {SERVICES.map((svc) => (
                  <Pressable
                    key={svc.id}
                    onPress={() => onSelectService(svc)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm active:opacity-90"
                    testID={`svc-${svc.id}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2">
                          {svc.icon()}
                          <Text className="text-base font-semibold text-gray-900">{svc.title}</Text>
                        </View>
                        <Text className="text-gray-500 mt-1">{svc.desc}</Text>
                        <View className="flex-row items-center gap-4 mt-3">
                          <View className="flex-row items-center gap-1">
                            <MaterialIcons name="attach-money" size={16} color="#111827" />
                            <Text className="text-sm font-medium text-gray-900">
                              {fmtMoney(svc.price)}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                            <Text className="text-sm text-gray-600">{svc.duration} mins</Text>
                          </View>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            /* Car Selection View */
            <>
              {/* Header */}
              <View className="flex-row items-center gap-3 mb-6">
                <Pressable 
                  onPress={onBackToServices} 
                  className="p-2 -ml-2 rounded-full active:bg-gray-100"
                >
                  <Ionicons name="chevron-back" size={20} color="#6B7280" />
                </Pressable>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {selectedService?.title}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {selectedService?.desc}
                  </Text>
                </View>
              </View>

              {/* Car Size Selection */}
              <View className="mb-8">
                <View className="flex-row items-center gap-2 mb-4">
                  <Ionicons name="car-sport" size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-900">Car Size</Text>
                </View>
                <View className="flex-row gap-3 justify-center flex-wrap">
                  {CAR_SIZES.map((size) => {
                    const getCarIcon = (sizeId: string) => {
                      switch (sizeId) {
                        case 'compact': return 'car-sport';
                        case 'suv': return 'car-outline';
                        case 'van': return 'bus';
                        default: return 'car';
                      }
                    };
                    
                    return (
                      <Pressable
                        key={size.id}
                        onPress={() => setSelectedCarSize(size.id)}
                        className={`flex-1 min-w-[80px] px-3 py-3 rounded-2xl border items-center gap-2 ${
                          selectedCarSize === size.id
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Ionicons 
                          name={getCarIcon(size.id) as any} 
                          size={20} 
                          color={selectedCarSize === size.id ? '#3B82F6' : '#6B7280'} 
                        />
                        <Text
                          className={`text-xs font-medium ${
                            selectedCarSize === size.id
                              ? 'text-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {size.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Quantity Stepper */}
              <View className="mb-8">
                <View className="flex-row items-center gap-2 mb-4">
                  <MaterialIcons name="format-list-numbered" size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-900">Number of vehicles</Text>
                </View>
                <View className="flex-row items-center justify-center gap-6">
                  <Pressable
                    onPress={() => setVehicleQuantity(Math.max(1, vehicleQuantity - 1))}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      vehicleQuantity <= 1 ? 'bg-gray-100' : 'bg-blue-100 active:bg-blue-200'
                    }`}
                    disabled={vehicleQuantity <= 1}
                  >
                    <Ionicons 
                      name="remove" 
                      size={20} 
                      color={vehicleQuantity <= 1 ? '#9CA3AF' : '#3B82F6'} 
                    />
                  </Pressable>
                  <View className="min-w-[48px] items-center">
                    <Text className="text-2xl font-bold text-gray-900">
                      {vehicleQuantity}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setVehicleQuantity(vehicleQuantity + 1)}
                    className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center active:bg-blue-200"
                  >
                    <Ionicons name="add" size={20} color="#3B82F6" />
                  </Pressable>
                </View>
              </View>

              {/* Pricing Summary */}
              <View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 mb-8 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-3">
                  <MaterialIcons name="receipt" size={18} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-700">Pricing Summary</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base font-bold text-gray-900">
                    Estimated total
                  </Text>
                  <Text className="text-xl font-bold text-blue-600">
                    {fmtMoney(calculatePrice())}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="payment" size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-500">Cash on completion</Text>
                </View>
              </View>

              {/* Continue Button */}
              <Pressable
                onPress={onContinue}
                className="bg-blue-600 rounded-2xl py-4 items-center shadow-sm active:bg-blue-700"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-white font-semibold text-base">Review Order</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </View>
              </Pressable>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Route Entry Modal */}
      <RouteEntryModal
        ref={routeModalRef}
        onDismiss={() => {}}
        onSelectPlace={onSelectPlace}
        onChooseOnMap={onChooseOnMap}
      />
    </View>
  );
}