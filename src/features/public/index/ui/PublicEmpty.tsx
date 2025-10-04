import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

type PublicEmptyProps = {
  onPrimary: () => void;
};

const PublicEmptyComponent = ({ onPrimary }: PublicEmptyProps) => {
  return (
    <View
      className="items-center justify-center gap-4 px-6 py-10 bg-white border border-dashed border-gray-300 rounded-2xl"
      testID="public.index.empty"
    >
      <Text className="text-base font-semibold text-gray-900">No services yet</Text>
      <Text className="text-sm text-center text-gray-500">
        Tell us where you are and we will show tailored options.
      </Text>
      <Pressable
        onPress={onPrimary}
        accessibilityRole="button"
        accessibilityLabel="Add your location"
        className="px-4 py-3 bg-blue-600 rounded-xl active:bg-blue-700"
      >
        <Text className="text-sm font-semibold text-white">Add location</Text>
      </Pressable>
    </View>
  );
};

export const PublicEmpty = memo(PublicEmptyComponent);

export type { PublicEmptyProps };
