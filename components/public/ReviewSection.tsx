import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import Card from '@/components/ui/Card';

export default function ReviewSection({
  title,
  children,
  testID,
}: { title: string; children: ReactNode; testID?: string }) {
  return (
    <Card className="p-4 mb-4" testID={testID}>
      <Text className="text-base font-semibold text-gray-900 mb-3">{title}</Text>
      <View className="h-px bg-gray-200 mb-3" />
      <View className="gap-3">{children}</View>
    </Card>
  );
}
