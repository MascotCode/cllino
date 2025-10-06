import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Tone = 'info' | 'warn' | 'danger';

type NoticeBannerProps = {
  tone?: Tone;
  title: string;
  body: string;
  testID?: string;
};

const toneMap: Record<Tone, { bg: string; border: string; icon: keyof typeof Ionicons.glyphMap; color: string; title: string; body: string; }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'information-circle',
    color: '#2563eb',
    title: 'text-blue-900',
    body: 'text-blue-800'
  },
  warn: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'alert-circle',
    color: '#b45309',
    title: 'text-amber-900',
    body: 'text-amber-800'
  },
  danger: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'warning',
    color: '#e11d48',
    title: 'text-rose-900',
    body: 'text-rose-800'
  }
};

export default function NoticeBanner({ tone = 'info', title, body, testID }: NoticeBannerProps) {
  const map = toneMap[tone];

  return (
    <View testID={testID} className={`rounded-2xl border px-component py-component ${map.bg} ${map.border}`}>
      <View className="flex-row items-start gap-component">
        <Ionicons name={map.icon} size={20} color={map.color} />
        <View className="flex-1 gap-tight">
          <Text className={`text-[18px] leading-[24px] font-semibold ${map.title}`}>{title}</Text>
          <Text className={`text-[16px] leading-[24px] ${map.body}`}>{body}</Text>
        </View>
      </View>
    </View>
  );
}
