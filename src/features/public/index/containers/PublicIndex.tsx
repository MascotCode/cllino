import { ActivityIndicator, Pressable, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PublicIndexHeader } from '../ui/PublicIndexHeader';
import { PublicActions } from '../ui/PublicActions';
import { PublicEmpty } from '../ui/PublicEmpty';
import { PublicError } from '../ui/PublicError';
import { PublicFooter } from '../ui/PublicFooter';
import { PublicCarSelection } from '../ui/PublicCarSelection';
import { PublicPriceConfirmModal } from '../ui/PublicPriceConfirmModal';
import { usePublicIndex } from '../hooks/usePublicIndex';

export const PublicIndex = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    loading,
    error,
    mapRef,
    sheetRef,
    addressLabel,
    coords,
    initialRegion,
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
    refresh,
    onPressSearch,
    onPressChooseOnMap,
    onUseMyLocation,

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
  } = usePublicIndex({
    onOpenAddressSelect: () => router.push('/(public)/address/select'),
    onOpenMapSelect: () => router.push('/(public)/address/map'),
    onNavigateToTime: ({ serviceId, carSize: nextCarSize, vehicleCount: count, priceTotal: total, breakdown: info }) => {
      const params = {
        serviceId,
        carSize: nextCarSize,
        vehicleCount: String(count),
        priceTotal: String(total),
        minTotal: String(info.minTotal),
        typicalMaxTotal: String(info.typicalMaxTotal),
      };
      router.push({ pathname: '/(public)/time', params });
    },
  });

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6" testID="public.index.screen">
        <PublicError message={error.message} onRetry={refresh} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" testID="public.index.screen">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        testID="public.index.map"
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        loadingEnabled
        onTouchStart={onMapGestureStart}
        onPanDrag={onMapGestureStart}
        onTouchEnd={onMapGestureEnd}
        onTouchCancel={onMapGestureEnd}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {coords && (
          <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} />
        )}
      </MapView>

      <Pressable
        onPress={onUseMyLocation}
        testID="public.index.cta.locate"
        accessibilityRole="button"
        accessibilityLabel="Use my location"
        className="absolute items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-sm"
        style={{ zIndex: 30, top: insets.top + 80, right: 16 }}
      >
        <Ionicons name="locate" size={20} color="#2563EB" />
      </Pressable>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints.map((point) => point)}
        enablePanDownToClose={false}
        enableOverDrag={false}
        enableHandlePanningGesture={false}
        enableContentPanningGesture
        handleStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        containerStyle={{ padding: 0 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {sheetView === 'services' ? (
            <View className="gap-6">
              <PublicIndexHeader
                addressLabel={addressLabel}
                onPressSearch={onPressSearch}
                onPressChooseOnMap={onPressChooseOnMap}
              />
              {loading ? (
                <View className="items-center py-10">
                  <ActivityIndicator color="#2563EB" />
                </View>
              ) : services.length > 0 ? (
                <PublicActions services={services} onSelect={onSelectService} />
              ) : (
                <PublicEmpty onPrimary={onPressSearch} />
              )}
            </View>
          ) : selectedService ? (
            <PublicCarSelection
              service={selectedService}
              carSizes={carSizes}
              carSize={carSize}
              onChangeCarSize={onChangeCarSize}
              vehicleCount={vehicleCount}
              onChangeVehicleCount={onChangeVehicleCount}
              breakdown={breakdown}
              priceTotal={priceTotal}
              showSoftCap={showSoftCap}
              showMinWarning={showMinWarning}
              effectiveAbsMax={effectiveAbsMax}
              onChangePrice={onChangePrice}
              onClampMinPrice={onClampMinPrice}
              onExceedAbsMax={onExceedAbsMax}
              onBack={onBackToServices}
            />
          ) : (
            <PublicEmpty onPrimary={onBackToServices} />
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      <PublicFooter
        onPrimary={onContinue}
        disabled={!selectedService || !breakdown || sheetView !== 'car-selection'}
      />

      <PublicPriceConfirmModal
        visible={pendingAbsMax !== null}
        pendingValue={pendingAbsMax}
        breakdown={breakdown}
        onConfirm={onConfirmHighPrice}
        onCancel={onCancelHighPrice}
      />
    </View>
  );
};
