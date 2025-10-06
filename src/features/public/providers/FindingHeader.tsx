import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

export function FindingHeader() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const [ellipsis, setEllipsis] = useState('');

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    pulseLoop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
      spin.setValue(0);
      pulse.setValue(0);
    };
  }, [spin, pulse]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEllipsis((prev) => {
        if (prev.length >= 3) {
          return '';
        }
        return prev + '.';
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <View
      testID="finding.header"
      accessibilityRole="header"
      className="flex-row items-center gap-3 px-4 pt-6 pb-4 bg-white"
    >
      <View className="relative">
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 rounded-full bg-blue-200"
          style={{
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />
        <Animated.View
          style={{ transform: [{ rotate }] }}
          className="w-3 h-3 rounded-full bg-blue-500"
        />
      </View>
      <Text className="text-2xl font-semibold text-neutral-900">
        Finding your pro
        {ellipsis}
      </Text>
    </View>
  );
}
