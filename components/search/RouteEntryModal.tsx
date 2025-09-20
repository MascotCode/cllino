import { Ionicons } from '@expo/vector-icons';
import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react';
import { Animated, Dimensions, Easing, Keyboard, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlaceSearch } from '../../hooks/usePlaceSearch';
import type { Place } from '../../types/places';

type Props = {
  onDismiss?: () => void;
  onSelectPlace: (place: Place) => void;
  onChooseOnMap: () => void;
};

export type RouteEntryModalRef = {
  open: () => void;
  close: () => void;
};

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// MOCK SAVED ADDRESSES DATA
const SAVED_ADDRESSES = [
  {
    id: 'home',
    label: 'Home',
    address: '123 Residence Street',
    notes: 'Apartment 4B, Blue building',
    icon: 'home' as const
  },
  {
    id: 'work',
    label: 'Work',
    address: '456 Business Avenue',
    notes: 'Office complex, parking level B1',
    icon: 'business' as const
  }
];

const RouteEntryModal = memo(forwardRef<RouteEntryModalRef, Props>(function RouteEntryModal({
  onDismiss,
  onSelectPlace,
  onChooseOnMap,
}, ref) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { results, recent, saveRecent } = usePlaceSearch(query);
  const slideAnim = useState(() => new Animated.Value(screenHeight))[0];
  const insets = useSafeAreaInsets();

  const open = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 250,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setQuery('');
      onDismiss?.();
    });
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSelectPlace = async (p: Place) => {
    await saveRecent(p);
    onSelectPlace(p);
    close();
  };

  const handleSelectAddress = (addr: typeof SAVED_ADDRESSES[0]) => {
    const place: Place = {
      id: addr.id,
      title: addr.address,
      subtitle: addr.notes,
      lat: 0, // Mock coordinates - in real app these would be stored
      lng: 0
    };
    handleSelectPlace(place);
  };

  const handleAddNewAddress = () => {
    // In a real app, this would open an address form or navigate to add address screen
    console.log('Add new address functionality');
    // For now, just close the modal
    close();
  };

  const handleUseCurrentLocation = () => {
    // In a real app, this would get user's current location
    console.log('Use current location functionality');
    // For now, just close the modal
    close();
  };

  const renderRow = (p: Place) => (
    <Pressable
      testID={`tid.route.suggestion.${p.id}`}
      key={p.id}
      className="flex-row items-center px-4 py-3 active:opacity-80"
      onPress={() => handleSelectPlace(p)}
    >
      <Ionicons name="location-outline" size={18} color="#6B7280" />
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-gray-900 font-medium">{p.title}</Text>
        {!!p.subtitle && <Text className="text-[12px] text-gray-500">{p.subtitle}</Text>}
      </View>
    </Pressable>
  );

  const renderAddressRow = (addr: typeof SAVED_ADDRESSES[0]) => (
    <Pressable
      key={addr.id}
      testID={`tid.route.address.${addr.id}`}
      className="flex-row items-center px-4 py-3 active:opacity-80"
      onPress={() => handleSelectAddress(addr)}
    >
      <Ionicons name={addr.icon} size={18} color="#3B82F6" />
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-gray-900 font-medium">{addr.label}</Text>
        <Text className="text-[13px] text-gray-900">{addr.address}</Text>
        <Text className="text-[12px] text-gray-500">{addr.notes}</Text>
      </View>
    </Pressable>
  );

  const data: Place[] = query.length ? results : recent;

  // Calculate modal height - full screen
  const modalHeight = screenHeight;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={close}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      {/* Dark backdrop */}
      <Pressable 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={close}
      >
        {/* Modal content - fixed height, positioned from bottom */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            height: modalHeight,
            width: screenWidth,
          }}
        >
          <Pressable 
            onPress={(e) => e.stopPropagation()}
            style={{ 
              flex: 1,
              backgroundColor: 'white',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              // Adjust for keyboard but don't move the modal
              paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom,
            }}
          >
            <View testID="tid.route.modal" style={{ flex: 1 }}>
              {/* Handle bar */}
              <View className="items-center py-3">
                <View className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </View>

              {/* Header with close button */}
              <View className="flex-row items-center justify-between px-4 pb-2">
                <Text className="text-[18px] font-semibold text-gray-900 flex-1 text-center">
                  Select Address
                </Text>
                <Pressable onPress={close} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name="close" size={18} color="#6B7280" />
                </Pressable>
              </View>

              {/* Fixed content section */}
              <View style={{ paddingHorizontal: 16 }}>
                {/* Search input */}
                <View className="mt-3 rounded-xl border border-gray-200 bg-white flex-row items-center px-3">
                  <Ionicons name="search" size={18} color="#6B7280" />
                  <TextInput
                    testID="tid.route.search"
                    placeholder="Search address"
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    className="flex-1 px-3 py-3 text-[16px] text-gray-900"
                    returnKeyType="search"
                  />
                  <Pressable onPress={() => setQuery('')} className="p-2">
                    <Ionicons name="close-circle" size={18} color={query ? '#9CA3AF' : 'transparent'} />
                  </Pressable>
                </View>

                {/* Use Current Location */}
                <Pressable
                  testID="tid.route.currentLocation"
                  onPress={handleUseCurrentLocation}
                  className="mt-3 flex-row items-center gap-2 px-2 py-1"
                >
                  <Ionicons name="location" size={18} color="#EF4444" />
                  <Text className="text-[14px] text-red-500 font-medium">Use Current Location</Text>
                </Pressable>

                {/* Choose on map */}
                <Pressable
                  testID="tid.route.chooseOnMap"
                  onPress={() => { onChooseOnMap(); close(); }}
                  className="mt-2 flex-row items-center gap-2 px-2 py-1"
                >
                  <Ionicons name="map-outline" size={18} color="#2563EB" />
                  <Text className="text-[14px] text-blue-600 font-medium">Choose on map</Text>
                </Pressable>
              </View>

              {/* Scrollable content section */}
              <View style={{ flex: 1, marginTop: 8 }}>
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* Saved Addresses Section - only show when not searching */}
                  {!query.length && (
                    <>
                      <Text className="px-4 pt-2 pb-1 text-[12px] uppercase tracking-wide text-gray-400">
                        Saved Addresses
                      </Text>
                      {SAVED_ADDRESSES.map((addr) => renderAddressRow(addr))}
                      
                      {/* Add New Address */}
                      <Pressable
                        testID="tid.route.addAddress"
                        onPress={handleAddNewAddress}
                        className="flex-row items-center px-4 py-3 active:opacity-80 mb-4"
                      >
                        <Ionicons name="add-circle-outline" size={18} color="#3B82F6" />
                        <Text className="ml-3 text-[15px] text-blue-600 font-medium">Add New Address</Text>
                      </Pressable>
                      
                      {/* Divider */}
                      <View className="h-px bg-gray-200 mx-4 mb-2" />
                    </>
                  )}
                  
                  {/* Search Results / Recent */}
                  <Text className="px-4 pt-2 pb-1 text-[12px] uppercase tracking-wide text-gray-400">
                    {query.length ? 'Suggestions' : 'Recent'}
                  </Text>
                  {data.map((item) => renderRow(item))}
                </ScrollView>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}));

export default RouteEntryModal;
