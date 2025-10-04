import AddressRow from '@/components/public/AddressRow';
import AddressSearchBar from '@/components/public/AddressSearchBar';
import ListSection from '@/components/public/ListSection';
import Card from '@/components/ui/Card';
import Title from '@/components/ui/Title';
import { useCheckoutAddress } from '@/lib/public/checkoutStore';
import { formatAddress, reverseGeocode, searchAddresses, type GeocodedAddress } from '@/utils/geocode';
import { Ionicons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock saved addresses - in real app, load from storage
const SAVED_ADDRESSES = [
    {
        id: 'home',
        label: 'Home',
        address: '123 Residence Street, Casablanca',
        icon: 'home' as const,
        lat: 33.5731,
        lng: -7.5898,
    },
    {
        id: 'work',
        label: 'Work',
        address: '456 Business Avenue, Casablanca',
        icon: 'briefcase' as const,
        lat: 33.5852,
        lng: -7.6298,
    },
];

// Mock recent addresses - in real app, load from recents storage
const RECENT_ADDRESSES: GeocodedAddress[] = [
    {
        id: 'recent-1',
        title: 'Morocco Mall',
        subtitle: 'Boulevard de la Corniche, Casablanca',
        lat: 33.5888,
        lng: -7.6861,
    },
    {
        id: 'recent-2',
        title: 'Twin Center',
        subtitle: 'Boulevard Zerktouni, Casablanca',
        lat: 33.5852,
        lng: -7.6298,
    },
];

export default function AddressSelectScreen() {
    const insets = useSafeAreaInsets();
    const { address: currentAddress, setAddressSelection } = useCheckoutAddress();
    const lastSyncedAddressRef = useRef(currentAddress);

    // State
    const [query, setQuery] = useState(currentAddress ?? '');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const results = await searchAddresses(query);
                setSearchResults(results);
            } catch (error) {
                console.warn('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle address selection
    const handleSelectAddress = useCallback(
        (address: string, lat?: number, lng?: number) => {
            lastSyncedAddressRef.current = address;
            setQuery(address);
            setAddressSelection({
                address,
                addressCoords: { label: address, lat, lng }
            });
            // Navigate back
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/');
            }
        },
        [setAddressSelection, setQuery]
    );

    // Use current location
    const handleUseCurrentLocation = useCallback(async () => {
        setLocationLoading(true);
        setPermissionDenied(false);

        try {
            // Check if location services are enabled
            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                if (Platform.OS === 'android') {
                    await IntentLauncher.startActivityAsync(
                        IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
                    );
                } else {
                    Alert.alert(
                        'Location Services Disabled',
                        'Please enable Location Services in Settings to use your current location.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
                        ]
                    );
                }
                return;
            }

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setPermissionDenied(true);
                return;
            }

            // Get current position
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocode to get address
            const geocoded = await reverseGeocode(latitude, longitude);
            const formattedAddress = geocoded.subtitle
                ? `${geocoded.title}, ${geocoded.subtitle}`
                : geocoded.title;

            handleSelectAddress(formattedAddress, latitude, longitude);
        } catch (error) {
            console.warn('Location error:', error);
            Alert.alert(
                'Location Error',
                'Could not get your current location. Please try again or select an address manually.'
            );
        } finally {
            setLocationLoading(false);
        }
    }, [handleSelectAddress]);

    // Choose on map
    const handleChooseOnMap = useCallback(() => {
        router.push('/(public)/address/map');
    }, []);

    // Add new address
    const handleAddNewAddress = useCallback(() => {
        // For MVP, show placeholder - in real app, navigate to address form
        Alert.alert(
            'Add New Address',
            'Address management will be available in a future update.',
            [{ text: 'OK' }]
        );
    }, []);

    // Open settings
    const handleOpenSettings = useCallback(() => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
        }
    }, []);

    // Clear search
    const handleClear = useCallback(() => {
        setQuery('');
        setSearchResults([]);
    }, []);

    useEffect(() => {
        if (lastSyncedAddressRef.current === currentAddress) {
            return;
        }
        lastSyncedAddressRef.current = currentAddress;
        setQuery(currentAddress ?? '');
    }, [currentAddress]);

    // Determine what to show
    const showSearchResults = query.trim().length > 0;
    const isEmpty = showSearchResults && !isSearching && searchResults.length === 0;

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                <Title>Select Address</Title>
                <Pressable
                    testID="address.modal.dismiss"
                    onPress={() => router.back()}
                    className="items-center justify-center w-10 h-10 rounded-full active:bg-gray-100"
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                >
                    <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
            </View>

            {/* Search Bar */}
            <View className="px-4 mt-3">
                <AddressSearchBar
                    value={query}
                    onChangeText={setQuery}
                    onClear={handleClear}
                    placeholder="Search address"
                />
            </View>

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Actions - only show when not searching */}
                {!showSearchResults && (
                    <View className="gap-3 mt-5">
                        {/* Use Current Location */}
                        {locationLoading ? (
                            <Card className="flex-row items-center py-4">
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="ml-3 text-base text-gray-600">Getting your location...</Text>
                            </Card>
                        ) : (
                            <AddressRow
                                testID="address.modal.useLocation"
                                icon="locate"
                                iconColor="#EF4444"
                                title="Use Current Location"
                                onPress={handleUseCurrentLocation}
                                showChevron={false}
                            />
                        )}

                        {/* Permission Denied State */}
                        {permissionDenied && (
                            <Card
                                testID="address.modal.permissionDenied"
                                className="border-red-200 bg-red-50"
                            >
                                <View className="flex-row items-start gap-3">
                                    <Ionicons name="alert-circle" size={20} color="#DC2626" />
                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-red-900">
                                            Location permission denied
                                        </Text>
                                        <Text className="mt-1 text-xs text-red-700">
                                            Allow location access in Settings to use your current location.
                                        </Text>
                                        <Pressable
                                            onPress={handleOpenSettings}
                                            className="self-start px-4 py-2 mt-3 bg-red-600 rounded-lg active:bg-red-700"
                                        >
                                            <Text className="text-sm font-semibold text-white">Open Settings</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Card>
                        )}

                        {/* Choose on Map */}
                        <AddressRow
                            testID="address.modal.chooseOnMap"
                            icon="map-outline"
                            iconColor="#3B82F6"
                            title="Choose on map"
                            onPress={handleChooseOnMap}
                        />
                    </View>
                )}

                {/* Saved Addresses - only show when not searching */}
                {!showSearchResults && SAVED_ADDRESSES.length > 0 && (
                    <ListSection title="Saved Addresses">
                        {SAVED_ADDRESSES.map((addr) => (
                            <AddressRow
                                key={addr.id}
                                testID={`address.modal.saved-${addr.id}`}
                                icon={addr.icon}
                                iconColor="#3B82F6"
                                title={addr.label}
                                subtitle={addr.address}
                                onPress={() => handleSelectAddress(addr.address, addr.lat, addr.lng)}
                            />
                        ))}

                        {/* Add New Address */}
                        <AddressRow
                            testID="address.modal.addNew"
                            icon="add-circle-outline"
                            iconColor="#3B82F6"
                            title="Add New Address"
                            onPress={handleAddNewAddress}
                            showChevron={false}
                        />
                    </ListSection>
                )}

                {/* Recent Addresses - only show when not searching */}
                {!showSearchResults && RECENT_ADDRESSES.length > 0 && (
                    <ListSection title="Recent">
                        {RECENT_ADDRESSES.map((addr) => (
                            <AddressRow
                                key={addr.id}
                                testID={`address.modal.recent-${addr.id}`}
                                icon="time-outline"
                                iconColor="#6B7280"
                                title={addr.title}
                                subtitle={addr.subtitle}
                                onPress={() => handleSelectAddress(formatAddress(addr), addr.lat, addr.lng)}
                            />
                        ))}
                    </ListSection>
                )}

                {/* Search Results */}
                {showSearchResults && (
                    <ListSection title="Search Results">
                        {/* Loading state */}
                        {isSearching && (
                            <View
                                testID="address.modal.loading"
                                className="flex-row items-center py-4"
                            >
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="ml-3 text-base text-gray-600">Searching...</Text>
                            </View>
                        )}

                        {/* Empty state */}
                        {isEmpty && (
                            <View testID="address.modal.empty" className="items-center py-8">
                                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                                <Text className="mt-4 text-base text-gray-500">
                                    No results for &quot;{query}&quot;
                                </Text>
                                <Text className="mt-1 text-sm text-gray-400">
                                    Try a different search term
                                </Text>
                            </View>
                        )}

                        {/* Results */}
                        {!isSearching &&
                            searchResults.map((result) => (
                                <AddressRow
                                    key={result.id}
                                    icon="location-outline"
                                    iconColor="#6B7280"
                                    title={result.title}
                                    subtitle={result.subtitle}
                                    onPress={() => handleSelectAddress(formatAddress(result), result.lat, result.lng)}
                                />
                            ))}
                    </ListSection>
                )}
            </ScrollView>
        </View>
    );
}
