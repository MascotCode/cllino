import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AmountInput from '@/components/ui/AmountInput';
import type { PricingBreakdown } from '@/utils/pricing';
import { fmtMoney } from '@/utils/format';
import type { PublicCarSizeOption, PublicServiceOption } from '../services/publicIndex.repo';

type PublicCarSelectionProps = {
  service: PublicServiceOption;
  carSizes: PublicCarSizeOption[];
  carSize: PublicCarSizeOption['id'];
  onChangeCarSize: (size: PublicCarSizeOption['id']) => void;
  vehicleCount: number;
  onChangeVehicleCount: (count: number) => void;
  breakdown: PricingBreakdown | null;
  priceTotal: number;
  showSoftCap: boolean;
  showMinWarning: boolean;
  effectiveAbsMax: number;
  onChangePrice: (value: number) => void;
  onClampMinPrice: () => void;
  onExceedAbsMax: (value: number) => void;
  onBack: () => void;
};

const iconForCarSize = (sizeId: string) => {
  if (sizeId === 'compact') return 'car-sport';
  if (sizeId === 'suv') return 'car-outline';
  if (sizeId === 'van') return 'bus';
  return 'car';
};

const PublicCarSelectionComponent = ({
  service,
  carSizes,
  carSize,
  onChangeCarSize,
  vehicleCount,
  onChangeVehicleCount,
  breakdown,
  priceTotal,
  showSoftCap,
  showMinWarning,
  effectiveAbsMax,
  onChangePrice,
  onClampMinPrice,
  onExceedAbsMax,
  onBack,
}: PublicCarSelectionProps) => {
  return (
    <View className="gap-8">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100" accessibilityRole="button">
          <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{service.title}</Text>
          <Text className="text-xs text-gray-500">{service.description}</Text>
        </View>
      </View>

      <View>
        <View className="flex-row items-center gap-2 mb-4">
          <Ionicons name="car-sport" size={16} color="#6B7280" />
          <Text className="text-sm font-medium text-gray-900">Car Size</Text>
        </View>
        <View className="flex-row flex-wrap justify-center gap-3" pointerEvents="auto">
          {carSizes.map((size) => {
            const isActive = size.id === carSize;
            const baseClass = 'flex-1 min-w-[92px] px-3 py-3 rounded-2xl border items-center gap-2';
            const stateClass = isActive ? ' bg-blue-50 border-blue-500' : ' bg-white border-gray-200';
            const iconColor = isActive ? '#2563EB' : '#6B7280';
            const textClass = isActive ? 'text-xs font-medium text-blue-700' : 'text-xs font-medium text-gray-700';

            return (
              <Pressable
                key={size.id}
                onPress={() => onChangeCarSize(size.id)}
                className={baseClass + stateClass}
                accessibilityRole="button"
                accessibilityLabel={'Select ' + size.label}
              >
                <Ionicons name={iconForCarSize(size.id) as any} size={20} color={iconColor} />
                <Text className={textClass}>{size.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <View className="flex-row items-center gap-2 mb-4">
          <MaterialIcons name="format-list-numbered" size={16} color="#6B7280" />
          <Text className="text-sm font-medium text-gray-900">Number of vehicles</Text>
        </View>
        <View className="flex-row items-center justify-center gap-6" pointerEvents="auto">
          <AmountInput
            testID="tid.vehicle.count"
            value={vehicleCount}
            step={1}
            min={1}
            typicalMax={5}
            absMax={5}
            onChange={onChangeVehicleCount}
            onClampMin={() => {
              onChangeVehicleCount(1);
            }}
            onExceedAbsMax={() => {
              onChangeVehicleCount(5);
            }}
          />
        </View>
      </View>

      <View className="p-5 border border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialIcons name="receipt" size={18} color="#6B7280" />
          <Text className="text-sm font-medium text-gray-700">Pricing Summary</Text>
        </View>

        {breakdown && (
          <View className="mb-3">
            <Text className="mb-2 text-base font-medium text-gray-900">Estimated total</Text>
            <View className="flex-row items-center gap-2 pl-12 mx-auto">
              <AmountInput
                testID="tid.price"
                value={priceTotal}
                step={5}
                min={breakdown.minTotal}
                typicalMax={breakdown.typicalMaxTotal}
                absMax={effectiveAbsMax}
                onClampMin={onClampMinPrice}
                onExceedAbsMax={onExceedAbsMax}
                onChange={onChangePrice}
              />
              <Text className="font-semibold text-blue-600">MAD</Text>
            </View>
          </View>
        )}

        {breakdown && (
          <View className="flex-row items-center gap-1 mb-2">
            <Text className="text-xs text-gray-500" testID="tid.price.minBadge">
              Min {fmtMoney(breakdown.minTotal)} ·
            </Text>
            <Text className="text-xs text-gray-500" testID="tid.price.typBadge">
              Typical up to {fmtMoney(breakdown.typicalMaxTotal)}
            </Text>
          </View>
        )}

        {showSoftCap && (
          <Text className="mb-2 text-xs text-blue-600" testID="tid.price.softcap">
            Above the typical range — that may match faster.
          </Text>
        )}

        <View className="flex-row items-center gap-1">
          <MaterialIcons name="payment" size={12} color="#6B7280" />
          <Text className="text-xs text-gray-500">Cash on completion</Text>
        </View>

        {showMinWarning && (
          <View className="px-3 py-2 mt-2 rounded-lg bg-red-50" testID="tid.price.warning.min">
            <Text className="text-xs text-red-600">At minimum price</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const PublicCarSelection = memo(PublicCarSelectionComponent);

export type { PublicCarSelectionProps };
