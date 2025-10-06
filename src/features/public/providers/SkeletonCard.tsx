import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SkeletonCardProps = {
  testID?: string;
};

export function SkeletonCard({ testID }: SkeletonCardProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      shimmer.setValue(0);
    };
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 300],
  });

  return (
    <View
      testID={testID}
      className="mx-4 my-3 h-[150px] rounded-3xl bg-white shadow-sm border border-neutral-200 overflow-hidden"
    >
      <View className="flex-1 bg-neutral-100" />
      <View className="h-12 bg-neutral-100" />
      <Animated.View
        pointerEvents="none"
        className="absolute top-0 bottom-0 w-40"
        style={{ transform: [{ translateX }] }}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-1"
        />
      </Animated.View>
    </View>
  );
}
