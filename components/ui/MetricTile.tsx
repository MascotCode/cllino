import { View, Text } from 'react-native';

type MetricTone = 'primary' | 'success' | 'neutral';

type MetricTileProps = {
  label: string;
  value: string | number;
  tone?: MetricTone;
};

const toneTokens: Record<MetricTone, { value: string; label: string; surface: string; border: string; }> = {
  primary: {
    value: 'text-blue-600',
    label: 'text-blue-700',
    surface: 'bg-blue-50',
    border: 'border-blue-200'
  },
  success: {
    value: 'text-green-600',
    label: 'text-green-700',
    surface: 'bg-green-50',
    border: 'border-green-200'
  },
  neutral: {
    value: 'text-gray-700',
    label: 'text-gray-800',
    surface: 'bg-gray-50',
    border: 'border-gray-200'
  }
};

export default function MetricTile({ label, value, tone = 'neutral' }: MetricTileProps) {
  const colors = toneTokens[tone];

  return (
    <View className={`flex-1 rounded-2xl border ${colors.surface} ${colors.border} px-component py-component gap-tight`}>
      <Text className={`text-[24px] leading-[32px] font-extrabold ${colors.value}`}>{value}</Text>
      <Text className={`text-[16px] leading-[24px] font-medium ${colors.label}`}>{label}</Text>
    </View>
  );
}
