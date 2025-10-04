import { memo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { fmtMoney } from '@/utils/format';
import type { PricingBreakdown } from '@/utils/pricing';

type PublicPriceConfirmModalProps = {
  visible: boolean;
  pendingValue: number | null;
  breakdown: PricingBreakdown | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const PublicPriceConfirmModalComponent = ({
  visible,
  pendingValue,
  breakdown,
  onConfirm,
  onCancel,
}: PublicPriceConfirmModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="items-center justify-center flex-1 px-6 bg-black/50">
        <View className="w-full max-w-sm p-6 bg-white rounded-2xl" testID="tid.price.confirm.absMax">
          <Text className="mb-2 text-lg font-bold text-gray-900">Unusual price</Text>
          <Text className="mb-6 text-gray-600">
            This is higher than the typical range
            {breakdown ? ' (' + fmtMoney(breakdown.typicalMaxTotal) + ' MAD).' : '.'}
            Continue with {pendingValue ? fmtMoney(pendingValue) : ''} MAD?
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              className="items-center flex-1 px-4 py-3 bg-gray-100 rounded-xl active:bg-gray-200"
            >
              <Text className="font-medium text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              className="items-center flex-1 px-4 py-3 bg-blue-600 rounded-xl active:bg-blue-700"
            >
              <Text className="font-medium text-white">Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const PublicPriceConfirmModal = memo(PublicPriceConfirmModalComponent);

export type { PublicPriceConfirmModalProps };
