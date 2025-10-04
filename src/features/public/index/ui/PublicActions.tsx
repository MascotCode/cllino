import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { PublicServiceOption } from '../services/publicIndex.repo';
import { fmtMoney } from '@/utils/format';

type PublicActionsProps = {
  services: PublicServiceOption[];
  onSelect: (service: PublicServiceOption) => void;
};

type IconEntry = {
  name: string;
  family: 'ion' | 'material';
};

const iconMap: Record<string, IconEntry> = {
  basic: { name: 'car', family: 'ion' },
  deep: { name: 'auto-fix-high', family: 'material' },
  interior: { name: 'corporate-fare', family: 'material' },
  premium: { name: 'diamond', family: 'material' },
};

const renderIcon = (serviceId: string, color: string) => {
  const entry = iconMap[serviceId] ?? { name: 'car', family: 'ion' };
  if (entry.family === 'material') {
    return <MaterialIcons name={entry.name as any} size={20} color={color} />;
  }
  return <Ionicons name={entry.name as any} size={20} color={color} />;
};

const PublicActionsComponent = ({ services, onSelect }: PublicActionsProps) => {
  const sorted = useMemo(() => services.slice(), [services]);

  return (
    <View className="gap-4">
      {sorted.map((service) => (
        <Pressable
          key={service.id}
          onPress={() => onSelect(service)}
          testID={'public.index.service.' + service.id}
          accessibilityRole="button"
          accessibilityLabel={'Select ' + service.title}
          className="border px-4 py-4 bg-white border-gray-200 shadow-sm rounded-2xl active:opacity-90"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2">
                {renderIcon(service.id, '#2563EB')}
                <Text className="text-base font-semibold text-gray-900">{service.title}</Text>
              </View>
              <Text className="mt-2 text-sm text-gray-500">{service.description}</Text>
              <View className="flex-row items-center gap-3 mt-3">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="attach-money" size={16} color="#111827" />
                  <Text className="text-sm font-medium text-gray-900">{fmtMoney(service.price)}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="schedule" size={16} color="#111827" />
                  <Text className="text-sm text-gray-700">{service.duration} min</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export const PublicActions = memo(PublicActionsComponent);

export type { PublicActionsProps };
