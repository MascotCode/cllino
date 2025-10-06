import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Provider = {
  id: string;
  name: string;
  eta: string;
  distance: string;
  car: string;
  price: string;
  rating: string;
};

type ProviderCardProps = {
  provider: Provider;
  index: number;
  staggerMs: number;
  onChoose: (provider: Provider) => void;
};

export function ProviderCard({ provider, index, staggerMs, onChoose }: ProviderCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(18);

    const delay = index * staggerMs;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [index, staggerMs, provider.id, opacity, translateY]);

  return (
    <Animated.View
      testID={'provider.card.' + provider.id}
      className="mx-4 my-3 rounded-3xl bg-white shadow-sm border border-neutral-200 p-4"
      style={{ opacity, transform: [{ translateY }] }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-semibold text-neutral-900" numberOfLines={1}>
            {provider.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-base">⭐</Text>
            <Text className="text-neutral-700">{provider.rating}</Text>
            <Text className="text-neutral-400">•</Text>
            <Text className="text-neutral-700">{provider.distance}</Text>
          </View>
        </View>
        <View className="px-3 py-1 rounded-full bg-blue-50">
          <Text className="text-xs font-medium text-blue-600">{provider.eta}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-neutral-500">🚗 {provider.car}</Text>
        <Text className="text-neutral-900 font-semibold">{provider.price}</Text>
      </View>
      <Pressable
        testID={'provider.choose.' + provider.id}
        onPress={() => onChoose(provider)}
        accessibilityRole="button"
        accessibilityLabel={'Choose ' + provider.name}
        className="mt-4 h-12 rounded-2xl overflow-hidden"
      >
        <LinearGradient
          colors={["#2563EB", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          <Text className="text-white font-semibold">Choose {provider.name}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export type { Provider };
