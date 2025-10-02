import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback } from 'react';
import { Alert, Text, View } from 'react-native';

import { tid } from '@/lib/testing/testIDs';
import { AppButton as Button } from './Button';
import Card from './Card';

type CashNoticeProps = {
  testID?: string;
  onLearnMore?: () => void;
};

export default function CashNotice({ testID = 'cash-notice', onLearnMore }: CashNoticeProps) {
  const handleLearnMore = useCallback(() => {
    if (onLearnMore) {
      onLearnMore();
      return;
    }

    Alert.alert(
      'Cash-only reminder',
      'All provider jobs are cash on completion. Confirm payment before finishing the job.'
    );
  }, [onLearnMore]);

  return (
    <Card
      className="gap-component !bg-amber-100"
      testID={testID}
      accessibilityRole="summary"
      accessibilityLabel="Cash-only reminder"

    >
      <View className="flex-row items-start gap-component">
        <View className="items-center justify-center w-10 h-10 border rounded-full border-amber-200 bg-amber-200" accessible={false}>
          <Ionicons name="cash-outline" size={20} color="#B45309" />
        </View>
        <View className="flex-1 gap-tight">
          <Text className="text-[18px] leading-[24px] font-semibold text-amber-900">
            Cash payments only
          </Text>
          <Text className="text-[16px] leading-[24px] text-amber-800">
            Finish is locked until cash is confirmed on the job.
          </Text>
        </View>
      </View>

      <Button
        variant="subtle"
        size="md"
        className="w-full bg-amber-200"
        onPress={handleLearnMore}
        testID={tid.provider.cashNotice.learn}
        accessibilityLabel="Learn more about cash-only requirements"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        Learn more
      </Button>
    </Card>
  );
}
