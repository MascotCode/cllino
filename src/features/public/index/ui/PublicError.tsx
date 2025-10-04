import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

type PublicErrorProps = {
  message?: string;
  onRetry: () => void;
};

const PublicErrorComponent = ({ message, onRetry }: PublicErrorProps) => {
  return (
    <View
      className="items-center justify-center gap-4 px-6 py-8 bg-red-50 border border-red-200 rounded-2xl"
      testID="public.index.error"
    >
      <Text className="text-base font-semibold text-red-700">Something went wrong</Text>
      <Text className="text-sm text-center text-red-600">
        {message || 'We could not load services right now. Please try again.'}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading"
        className="px-4 py-3 bg-red-600 rounded-xl active:bg-red-700"
      >
        <Text className="text-sm font-semibold text-white">Retry</Text>
      </Pressable>
    </View>
  );
};

export const PublicError = memo(PublicErrorComponent);

export type { PublicErrorProps };
