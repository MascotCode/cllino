import { AppButton } from '@/components/ui/Button';
import { useCheckoutStore } from '@/lib/public/checkoutStore';
import { reverseGeocode } from '@/utils/geocode';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INITIAL_REGION: Region = {
    latitude: 33.5731,
    longitude: -7.5898,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export default function AddressMapScreen() {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const setOrder = useCheckoutStore((state) => state.setOrder);

    // State
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [addressLabel, setAddressLabel] = useState<string>('Tap to select location');
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Handle map press to place pin
    const handleMapPress = useCallback(
        async (event: any) => {
            const { latitude, longitude } = event.nativeEvent.coordinate;

            setSelectedLocation({ lat: latitude, lng: longitude });
            setIsGeocoding(true);

            try {
                // Reverse geocode to get human-readable address
                const geocoded = await reverseGeocode(latitude, longitude);
                const formatted = geocoded.subtitle
                    ? `${geocoded.title}, ${geocoded.subtitle}`
                    : geocoded.title;
                setAddressLabel(formatted);
            } catch (error) {
                console.warn('Geocoding error:', error);
                setAddressLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } finally {
                setIsGeocoding(false);
            }
        },
        []
    );

    // Confirm selection and save to store
    const handleConfirm = useCallback(() => {
        if (!selectedLocation) return;

        setOrder({ address: addressLabel });

        // Navigate back to address select or main flow
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(public)/');
        }
    }, [selectedLocation, addressLabel, setOrder]);

    // Go back without selecting
    const handleBack = useCallback(() => {
        router.back();
    }, []);

    return (
        <View className="flex-1 bg-white">
            {/* Map */}
            <MapView
                ref={mapRef}
                testID="address.map.pin"
                style={{ flex: 1 }}
                provider={PROVIDER_GOOGLE}
                initialRegion={INITIAL_REGION}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton={false}
                toolbarEnabled={false}
            >
                {selectedLocation && (
                    <Marker
                        coordinate={{
                            latitude: selectedLocation.lat,
                            longitude: selectedLocation.lng,
                        }}
                        draggable
                        onDragEnd={handleMapPress}
                    />
                )}
            </MapView>

            {/* Back Button - Top Left */}
            <Pressable
                onPress={handleBack}
                className="absolute bg-white rounded-full shadow-lg w-12 h-12 items-center justify-center active:bg-gray-100"
                style={{
                    top: insets.top + 16,
                    left: 16,
                }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>

            {/* Address Label Card - Top Center */}
            {selectedLocation && (
                <View
                    className="absolute bg-white rounded-2xl shadow-lg px-4 py-3 mx-4"
                    style={{
                        top: insets.top + 16,
                        left: 72,
                        right: 16,
                    }}
                >
                    <View className="flex-row items-center">
                        {isGeocoding ? (
                            <>
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="ml-2 text-sm text-gray-600">Getting address...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="location" size={16} color="#3B82F6" />
                                <Text className="ml-2 flex-1 text-sm font-medium text-gray-900" numberOfLines={2}>
                                    {addressLabel}
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            )}

            {/* Instructions - Center Bottom (when no location selected) */}
            {!selectedLocation && (
                <View
                    className="absolute bg-white rounded-2xl shadow-lg px-6 py-4 mx-8"
                    style={{
                        bottom: insets.bottom + 100,
                        left: 16,
                        right: 16,
                    }}
                >
                    <View className="items-center">
                        <Ionicons name="hand-left-outline" size={32} color="#3B82F6" />
                        <Text className="mt-2 text-base font-semibold text-gray-900 text-center">
                            Tap anywhere on the map
                        </Text>
                        <Text className="mt-1 text-sm text-gray-600 text-center">
                            Place a pin at your desired location
                        </Text>
                    </View>
                </View>
            )}

            {/* Confirm Button - Bottom */}
            {selectedLocation && (
                <View
                    className="absolute left-0 right-0 px-4"
                    style={{
                        bottom: insets.bottom + 16,
                    }}
                >
                    <AppButton
                        testID="address.map.confirm"
                        onPress={handleConfirm}
                        disabled={isGeocoding}
                        variant="primary"
                        className="shadow-lg"
                    >
                        Confirm Location
                    </AppButton>
                </View>
            )}
        </View>
    );
}

