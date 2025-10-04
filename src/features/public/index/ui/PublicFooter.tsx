import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PublicFooterProps = {
  onPrimary: () => void;
  disabled?: boolean;
  label?: string;
  testID?: string;
};

const PublicFooterComponent = ({
  onPrimary,
  disabled,
  label = 'Review Order',
  testID = 'public.index.footer.primary',
}: PublicFooterProps) => {
  return (
    <View className="px-4 pb-6 pt-3 bg-white border-t border-gray-200">
      <Pressable
        onPress={onPrimary}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        accessibilityLabel={label}
        testID={testID}
        className="items-center justify-center flex-row gap-2 py-4 bg-blue-600 rounded-2xl shadow-sm"
        style={disabled ? { opacity: 0.6 } : undefined}
      >
        <Text className="text-base font-semibold text-white">{label}</Text>
        <Ionicons name="arrow-forward" size={18} color="white" />
      </Pressable>
    </View>
  );
};

export const PublicFooter = memo(PublicFooterComponent);

export type { PublicFooterProps };
