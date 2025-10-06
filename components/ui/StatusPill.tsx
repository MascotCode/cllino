import { Text, View } from 'react-native';

type StatusTone = 'success' | 'neutral' | 'warn' | 'muted';

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
  testID?: string;
};

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  warn: 'bg-amber-100 text-amber-800 border-amber-200',
  muted: 'bg-gray-50 text-gray-500 border-gray-200'
};

export default function StatusPill({ label, tone = 'neutral', testID }: StatusPillProps) {
  return (
    <View testID={testID} className={`px-3 py-1 rounded-full border ${toneClasses[tone]}`}>
      <Text className="text-[12px] leading-[16px] font-medium">{label}</Text>
    </View>
  );
}
