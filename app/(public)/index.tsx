import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { Link } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, Text, TextInput, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

// Tiny util to render money like "35 MAD"
const fmtMoney = (amount: number, currency = 'MAD') => `${amount} ${currency}`;

const SERVICES = [
  { id: 'basic', title: 'Basic Cleaning', desc: 'Essential wash & dry for your vehicle', price: 15, duration: 30, icon: (c='#2563eb') => <Ionicons name="car" size={20} color={c} /> },
  { id: 'deep', title: 'Deep Cleaning', desc: 'Thorough interior & exterior detailing', price: 35, duration: 90, icon: (c='#2563eb') => <MaterialIcons name="auto-fix-high" size={20} color={c} /> },
  { id: 'interior', title: 'Interior Detailing', desc: 'Complete interior restoration', price: 25, duration: 60, icon: (c='#2563eb') => <MaterialIcons name="corporate-fare" size={20} color={c} /> },
  { id: 'premium', title: 'Premium Package', desc: 'Full service with wax & protection', price: 55, duration: 120, icon: (c='#2563eb') => <MaterialIcons name="diamond" size={20} color={c} /> },
];

export default function ServiceHome() {
  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '45%', '88%'], []);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressLabel, setAddressLabel] = useState<string>('');

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
      sheetRef.current?.snapToIndex(1);
    } catch (e) {
      console.warn('use-location error', e);
      Alert.alert('Location error', 'Could not get your current position.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        loadingEnabled
      >
        {coords && (
          <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} />
        )}
      </MapView>

      {/* Top-right small controls (placeholders) */}
      <View className="absolute top-4 right-4 flex-row gap-2">
        <Pressable className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm">
          <Ionicons name="settings-outline" size={18} color="#111827" />
        </Pressable>
      </View>

      {/* FAB: Use my location */}
      <Pressable
        testID="btn-current-location"
        onPress={onUseMyLocation}
        className="absolute right-4 bottom-44 w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-200 shadow"
      >
        <Ionicons name="locate" size={22} color="#2563eb" />
      </Pressable>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {/* Search pill */}
          <View
            className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-3"
            testID="search-pill"
          >
            <Ionicons name="search" size={18} color="#6b7280" />
            <TextInput
              placeholder={addressLabel || 'Enter pickup or service location'}
              placeholderTextColor="#9ca3af"
              className="ml-2 flex-1 text-gray-900"
            />
          </View>

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
              <Link key={svc.id} href="./address" asChild>
                <Pressable
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
              </Link>
            ))}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}