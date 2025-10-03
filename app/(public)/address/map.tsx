import { AppButton } from '@/components/ui/Button';
import { useCheckoutStore } from '@/lib/public/checkoutStore';
import { reverseGeocode } from '@/utils/geocode';
import { Ionicons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Alert, Animated, Linking, Platform, Pressable, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INITIAL_REGION: Region = {
    latitude: 33.5731,
    longitude: -7.5898,
    latitudeDelta: 0.005, // Match home map zoom when location selected
    longitudeDelta: 0.005,
};

const GEOCODE_DEBOUNCE_MS = 400;
const DISTANCE_THRESHOLD_METERS = 30;

// Helper: calculate distance in meters between two coordinates
function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function AddressMapScreen() {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const setOrder = useCheckoutStore((state) => state.setOrder);
    const addressCoords = useCheckoutStore((state) => state.addressCoords);
    const currentAddress = useCheckoutStore((state) => state.address);

    // Determine initial position from store or fallback to default
    const initialPosition = addressCoords?.lat && addressCoords?.lng
        ? { lat: addressCoords.lat, lng: addressCoords.lng }
        : { lat: INITIAL_REGION.latitude, lng: INITIAL_REGION.longitude };

    // State
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(initialPosition);
    const [addressLabel, setAddressLabel] = useState<string>(currentAddress || 'Loading address...');
    const [isDragging, setIsDragging] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(!currentAddress); // Only show loading if we don't have an address yet
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [initialRegion] = useState<Region>({
        latitude: initialPosition.lat,
        longitude: initialPosition.lng,
        latitudeDelta: 0.005, // Closer zoom when coming from selected address
        longitudeDelta: 0.005,
    });

    // Refs for debouncing and tracking
    const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastGeocodedRef = useRef<{ lat: number; lng: number } | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Pin bounce animation
    const pinBounceAnim = useRef(new Animated.Value(0)).current;

    // Track previous coords to avoid redundant updates
    const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
    const isInitialLoadRef = useRef(true);
    const hasMountedRef = useRef(false);

    // Sync with store when address changes (from select screen or "Use My Location")
    useEffect(() => {
        if (addressCoords?.lat && addressCoords?.lng) {
            const newPosition = { lat: addressCoords.lat, lng: addressCoords.lng };

            // Check if location actually changed
            const hasChanged =
                !prevCoordsRef.current ||
                prevCoordsRef.current.lat !== newPosition.lat ||
                prevCoordsRef.current.lng !== newPosition.lng;

            if (hasChanged) {
                prevCoordsRef.current = newPosition;

                // Update center
                setMapCenter(newPosition);

                // Update user location for recenter
                setUserLocation(newPosition);

                // Only animate if this is not the first mount
                if (hasMountedRef.current) {
                    // Animate map to new location (match home map behavior)
                    mapRef.current?.animateToRegion(
                        {
                            latitude: newPosition.lat,
                            longitude: newPosition.lng,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        },
                        500
                    );
                }

                // Update address label
                if (currentAddress) {
                    setAddressLabel(currentAddress);
                    setIsGeocoding(false);
                } else {
                    performReverseGeocode(newPosition.lat, newPosition.lng);
                }
            }
        } else if (!prevCoordsRef.current) {
            // No address selected yet, geocode the default center on mount only
            prevCoordsRef.current = initialPosition;
            performReverseGeocode(initialPosition.lat, initialPosition.lng);
        }

        // Mark as mounted after first effect run
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
        }
    }, [addressCoords?.lat, addressCoords?.lng, currentAddress]);

    // Trigger bounce animation
    const bouncePinAnimation = useCallback(() => {
        Animated.sequence([
            Animated.timing(pinBounceAnim, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(pinBounceAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [pinBounceAnim]);

    // Reverse geocode the map center
    const performReverseGeocode = useCallback(
        async (lat: number, lng: number) => {
            // Check if we need to geocode (threshold check)
            if (lastGeocodedRef.current) {
                const distance = haversineDistance(
                    lastGeocodedRef.current.lat,
                    lastGeocodedRef.current.lng,
                    lat,
                    lng
                );
                if (distance < DISTANCE_THRESHOLD_METERS) {
                    // Too close to last geocoded location, skip
                    setIsDragging(false);
                    return;
                }
            }

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            setIsGeocoding(true);
            lastGeocodedRef.current = { lat, lng };

            try {
                const geocoded = await reverseGeocode(lat, lng);
                const formatted = geocoded.subtitle
                    ? `${geocoded.title}, ${geocoded.subtitle}`
                    : geocoded.title;
                setAddressLabel(formatted);
                AccessibilityInfo.announceForAccessibility?.(`Updated address to ${formatted}`);
                bouncePinAnimation();
            } catch (error) {
                console.warn('Geocoding error:', error);
                setAddressLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            } finally {
                setIsGeocoding(false);
                setIsDragging(false);
            }
        },
        [bouncePinAnimation]
    );

    // Handle region change (dragging started)
    const handleRegionChange = useCallback(() => {
        // Skip setting isDragging on initial load
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }

        setIsDragging(true);
        // Cancel pending geocode
        if (geocodeTimerRef.current) {
            clearTimeout(geocodeTimerRef.current);
            geocodeTimerRef.current = null;
        }
    }, []);

    // Handle region change complete (dragging stopped)
    const handleRegionChangeComplete = useCallback(
        (region: Region) => {
            // Skip on initial load (first region change is just the map rendering)
            if (!hasMountedRef.current) {
                return;
            }

            const { latitude, longitude } = region;
            setMapCenter({ lat: latitude, lng: longitude });

            // Debounce reverse geocoding
            if (geocodeTimerRef.current) {
                clearTimeout(geocodeTimerRef.current);
            }

            geocodeTimerRef.current = setTimeout(() => {
                performReverseGeocode(latitude, longitude);
            }, GEOCODE_DEBOUNCE_MS);
        },
        [performReverseGeocode]
    );

    // Open platform settings
    const handleOpenSettings = useCallback(() => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
        }
    }, []);

    // Recenter: request permission, fetch GPS, animate, geocode
    const handleRecenterPress = useCallback(async () => {
        setPermissionDenied(false);
        setLocationLoading(true);
        try {
            const servicesOn = await Location.hasServicesEnabledAsync();
            if (!servicesOn) {
                if (Platform.OS === 'android') {
                    await IntentLauncher.startActivityAsync(
                        IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
                    );
                } else {
                    Alert.alert(
                        'Location Services Disabled',
                        'Enable Location Services in Settings to use your current location.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: handleOpenSettings },
                        ]
                    );
                }
                return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setPermissionDenied(true);
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const { latitude, longitude } = pos.coords;

            setUserLocation({ lat: latitude, lng: longitude });

            mapRef.current?.animateToRegion(
                {
                    latitude,
                    longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                },
                500
            );

            setMapCenter({ lat: latitude, lng: longitude });

            // Debounced flow will also trigger via onRegionChangeComplete, but run once eagerly
            performReverseGeocode(latitude, longitude);
        } catch (e) {
            console.warn('recenter error', e);
            Alert.alert('Location error', 'Could not get your current position.');
        } finally {
            setLocationLoading(false);
        }
    }, [handleOpenSettings, performReverseGeocode]);

    // Confirm selection and save to store
    const handleConfirm = useCallback(() => {
        setOrder({
            address: addressLabel,
            addressCoords: {
                label: addressLabel,
                lat: mapCenter.lat,
                lng: mapCenter.lng,
            },
        });

        // Navigate back to address select or main flow
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    }, [addressLabel, mapCenter, setOrder]);

    // Go back without selecting
    const handleBack = useCallback(() => {
        router.back();
    }, []);

    return (
        <View className="flex-1 bg-white">
            {/* Map - Full Screen */}
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation
                showsMyLocationButton={false}
                toolbarEnabled={false}
            />

            {/* Fixed Center Pin Overlay */}
            <View
                testID="address.map.pin"
                className="absolute items-center justify-center"
                style={{
                    top: '50%',
                    left: '50%',
                    marginLeft: -24,
                    marginTop: -48,
                }}
                pointerEvents="none"
            >
                <Animated.View
                    style={{
                        transform: [{ translateY: pinBounceAnim }],
                    }}
                >
                    <Ionicons
                        name="pin-sharp"
                        size={56}
                        color={isDragging ? '#9CA3AF' : '#DC2626'}
                    />
                </Animated.View>
            </View>

            {/* Back Button - Top Left */}
            <Pressable
                onPress={handleBack}
                className="absolute items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg active:bg-gray-100"
                style={{
                    top: insets.top + 16,
                    left: 16,
                }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>

            {/* Recenter Button - Top Right */}
            <Pressable
                testID="address.map.recenter"
                onPress={handleRecenterPress}
                className="absolute items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg active:bg-gray-100"
                style={{
                    top: insets.top + 16,
                    right: 16,
                }}
                accessibilityRole="button"
                accessibilityLabel="Recenter map"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                {locationLoading ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                    <Ionicons name="locate" size={24} color="#3B82F6" />
                )}
            </Pressable>

            {/* Address Label Card - Below Top Controls */}
            <View
                className="absolute px-4 py-3 mx-4 bg-white shadow-lg rounded-2xl"
                style={{
                    top: insets.top + 80,
                    left: 16,
                    right: 16,
                }}
            >
                <View className="flex-row items-center">
                    {isGeocoding || isDragging ? (
                        <>
                            <ActivityIndicator size="small" color="#3B82F6" />
                            <Text className="ml-2 text-sm text-gray-600">
                                {isDragging ? 'Moving map...' : 'Getting address...'}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="location" size={16} color="#3B82F6" />
                            <Text className="flex-1 ml-2 text-sm font-medium text-gray-900" numberOfLines={2}>
                                {addressLabel}
                            </Text>
                        </>
                    )}
                </View>
            </View>

            {/* Permission Denied Banner */}
            {permissionDenied && (
                <View
                    className="absolute px-4 py-3 mx-4 border border-red-200 bg-red-50 rounded-2xl"
                    style={{ top: insets.top + 136, left: 16, right: 16 }}
                >
                    <View className="flex-row items-start gap-3">
                        <Ionicons name="alert-circle" size={18} color="#DC2626" />
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-red-900">Location permission denied</Text>
                            <Text className="mt-1 text-xs text-red-700">
                                Allow location access in Settings to use your current location.
                            </Text>
                            <Pressable
                                onPress={handleOpenSettings}
                                className="self-start px-3 py-2 mt-3 bg-red-600 rounded-lg active:bg-red-700"
                                accessibilityRole="button"
                            >
                                <Text className="text-xs font-semibold text-white">Open Settings</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

            {/* Confirm Button - Bottom */}
            <View
                className="absolute left-0 right-0 px-4"
                style={{
                    bottom: insets.bottom + 16,
                }}
            >
                <AppButton
                    testID="address.map.confirm"
                    onPress={handleConfirm}
                    disabled={isGeocoding || isDragging}
                    variant="primary"
                    className="shadow-lg"
                >
                    Confirm Location
                </AppButton>
            </View>
        </View>
    );
}

