import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type PublicIndexHeaderProps = {
  addressLabel: string;
  onPressSearch: () => void;
  onPressChooseOnMap: () => void;
};

const PublicIndexHeaderComponent = ({
  addressLabel,
  onPressSearch,
  onPressChooseOnMap,
}: PublicIndexHeaderProps) => {
  return (
    <View className="gap-3">
      <Pressable
        onPress={onPressSearch}
        testID="public.index.search"
        accessibilityRole="button"
        accessibilityLabel="Select pickup or service location"
        className="flex-row items-center border px-4 py-3 bg-white border-gray-200 rounded-2xl active:opacity-80 shadow-sm"
      >
        <Ionicons name="search" size={18} color="#6B7280" />
        <Text className="flex-1 ml-2 text-sm text-gray-900" numberOfLines={1}>
          {addressLabel || 'Enter pickup or service location'}
        </Text>
      </Pressable>

      <Pressable
        onPress={onPressChooseOnMap}
        testID="public.index.cta.chooseOnMap"
        accessibilityRole="button"
        accessibilityLabel="Choose location on map"
        className="flex-row items-center justify-center gap-2 px-4 py-3 border bg-white border-gray-200 rounded-2xl active:opacity-85"
      >
        <Ionicons name="map-outline" size={18} color="#2563EB" />
        <Text className="text-sm font-semibold text-blue-700">Choose on map</Text>
      </Pressable>

      <View className="flex-row rounded-full p-1 bg-slate-100">
        <Pressable className="items-center flex-1 rounded-full py-2 bg-white" accessibilityRole="button">
          <View className="flex-row items-center gap-1">
            <Ionicons name="car" size={16} color="#2563EB" />
            <Text className="text-xs font-semibold text-gray-900">Car Wash</Text>
          </View>
        </Pressable>
        <Pressable className="items-center flex-1 opacity-50 py-2" disabled accessibilityRole="button">
          <View className="flex-row items-center gap-1">
            <Ionicons name="bicycle" size={16} color="#6B7280" />
            <Text className="text-xs text-gray-500">Motorcycle</Text>
          </View>
        </Pressable>
        <Pressable className="items-center flex-1 opacity-50 py-2" disabled accessibilityRole="button">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="local-shipping" size={16} color="#6B7280" />
            <Text className="text-xs text-gray-500">Trucks</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export const PublicIndexHeader = memo(PublicIndexHeaderComponent);

export type { PublicIndexHeaderProps };
