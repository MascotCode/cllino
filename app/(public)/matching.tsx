import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// ---- config ----
const REVEAL_AFTER_MS = 900;   // delay before first card
const STAGGER_MS = 400;        // between cards

type Provider = { id: string; name: string; eta: string; distance: string; car: string; price: string; rating: string };
type MatchingParams = { id?: string | string[]; providers?: string | string[] };

function useProviders(providersParam?: string | string[]): Provider[] {
  return useMemo(() => {
    const raw = Array.isArray(providersParam) ? providersParam[0] : providersParam;
    if (raw) {
      try {
        const parsed = JSON.parse(String(raw)) as Provider[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to parse providers param', error);
      }
    }
    return [
      { id: '1', name: 'John',  eta: '5 min away',  distance: '2.1 km', car: 'Sedan',  price: '120 MAD', rating: '4.8' },
      { id: '2', name: 'Maria', eta: '8 min away',  distance: '3.0 km', car: 'SUV',    price: '135 MAD', rating: '4.6' },
      { id: '3', name: 'Youssef', eta: '11 min away', distance: '3.8 km', car: 'Hatch', price: '110 MAD', rating: '4.7' },
    ];
  }, [providersParam]);
}

// ---- header with radar + animated dots ----
function MatchingHeader(){
  const ring1 = useRef(new Animated.Value(0)).current; // scale + fade ring
  const ring2 = useRef(new Animated.Value(0)).current; // delayed ring
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const ring = (v: Animated.Value, delay = 0) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    ring(ring1, 0);
    ring(ring2, 600);

    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 300);
    return () => {
      clearInterval(interval);
    };
  }, [ring1, ring2]);

  const dotText = '.'.repeat(dotCount);
  const ringStyle = (v: Animated.Value) => ({
    transform: [{ scale: v.interpolate({ inputRange:[0,1], outputRange:[0.6, 1.6] }) }],
    opacity: v.interpolate({ inputRange:[0,1], outputRange:[0.35, 0] }),
  });

  return (
    <View testID="matching.header" className="px-4 pt-6 pb-3">
      <Text className="text-2xl font-semibold text-neutral-900">Finding your pro{dotText}</Text>
      <View className="mt-3 items-center justify-center">
        <View className="w-14 h-14 items-center justify-center">
          <Animated.View testID="matching.radar" style={[{ position:'absolute', left:0, right:0, top:0, bottom:0, borderRadius:9999, backgroundColor:'#3B82F6' }, ringStyle(ring1)]} />
          <Animated.View style={[{ position:'absolute', left:0, right:0, top:0, bottom:0, borderRadius:9999, backgroundColor:'#60A5FA' }, ringStyle(ring2)]} />
          <View className="w-3 h-3 rounded-full bg-blue-600" />
        </View>
      </View>
    </View>
  );
}

// ---- provider card with enter animation ----
function ProviderCard({ p, index, onChoose }: { p: Provider; index: number; onChoose: (p: Provider) => void }){
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, index * STAGGER_MS);
    return () => clearTimeout(t);
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform:[{ translateY }] }} className="mx-4 my-3 rounded-3xl bg-white shadow-sm border border-neutral-200 p-4" testID={`matching.card.${p.id}`}>
      <View className="flex-row justify-between items-start">
        <Text className="text-lg font-semibold text-neutral-900">{p.name}</Text>
        <View className="px-3 py-1 rounded-full bg-blue-50"><Text className="text-blue-600 text-xs font-medium">{p.eta}</Text></View>
      </View>
      <View className="flex-row items-center gap-4 mt-2">
        <Text className="text-neutral-700">Rating {p.rating}</Text>
        <Text className="text-neutral-400">|</Text>
        <Text className="text-neutral-700">{p.distance}</Text>
      </View>
      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-neutral-500">Vehicle {p.car}</Text>
        <Text className="text-neutral-900 font-semibold">{p.price}</Text>
      </View>
      {/* SAFE gradient inside Pressable */}
      <Pressable testID={`matching.choose.${p.id}`} onPress={() => onChoose(p)} accessibilityRole="button" accessibilityLabel={`Choose ${p.name}`} className="mt-4 h-12 rounded-2xl overflow-hidden">
        <LinearGradient colors={["#2563EB","#3B82F6"]} start={{x:0,y:0}} end={{x:1,y:1}} className="flex-1 items-center justify-center">
          <Text className="text-white font-semibold">Choose {p.name}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function MatchingScreen(){
  const params = useLocalSearchParams<MatchingParams>();
  const providers = useProviders(params.providers);

  const orderId = useMemo(() => {
    const value = params.id;
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
    return undefined;
  }, [params.id]);

  const [visible, setVisible] = useState<Provider[]>([]);

  useEffect(() => {
    let indexRef = 0;
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const start = () => {
      const tick = () => {
        if (!mounted) return;
        if (indexRef < providers.length) {
          setVisible(prev => [...prev, providers[indexRef]]);
          indexRef += 1;
          timer = setTimeout(tick, STAGGER_MS);
        }
      };
      tick();
    };
    const startDelay = setTimeout(start, REVEAL_AFTER_MS);
    return () => {
      mounted = false;
      clearTimeout(startDelay);
      if (timer) clearTimeout(timer);
    };
  }, [providers]);

  const onChoose = (p: Provider) => {
    const nextParams: Record<string, string> = { providerId: p.id };
    if (orderId) {
      nextParams.id = orderId;
    }
    router.push({ pathname: './confirm', params: nextParams });
  };

  return (
    <View className="flex-1 bg-white">
      <MatchingHeader />
      <View className="mt-1">
        {visible.map((p, idx) => (
          <ProviderCard key={p.id} p={p} index={idx} onChoose={onChoose} />
        ))}
      </View>
    </View>
  );
}
