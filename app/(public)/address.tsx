import { useState } from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { SegmentPills } from '../../components/ui/SegmentPills';

const SERVICES = [
  { id: 'basic', label: 'Basic' },
  { id: 'deep', label: 'Deep' },
  { id: 'interior', label: 'Interior' }
];

export default function AddressScreen() {
  const [service, setService] = useState('basic');
  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <View className="flex-1">
        <ImageBackground source={require('../../assets/images/react-logo.png')} resizeMode="cover" className="flex-1 opacity-95">
          <View className="absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full bg-primary border-2 border-white" />
          <View className="absolute right-4 bottom-44">
            <Button testID="gps-button" variant="subtle" size="md">➤</Button>
          </View>
        </ImageBackground>
      </View>

      <View className="bg-surface-0 px-4 pt-4 pb-6 rounded-t-2xl shadow-sheet border-t border-border-subtle">
        <SegmentPills items={SERVICES} value={service} onChange={setService} testIDPrefix="service-pill" />
        <Link href="/(public)/price" asChild>
          <View testID="search-bar" className="mt-4 rounded-2xl bg-surface-100 border border-border-subtle px-4 py-4">
            <Text className="text-text-muted">Where to & for how much?</Text>
          </View>
        </Link>
        <View className="mt-4 gap-3">
          {['Av. Akioud', 'Marrakesh Menara Airport', 'Jemaa El-Fna'].map(label => (
            <View key={label} className="flex-row items-center gap-3 rounded-2xl bg-surface-0 border border-border-subtle px-4 py-3 shadow-card">
              <Text className="text-text-muted">📍</Text>
              <Text className="text-text-primary">{label}</Text>
            </View>
          ))}
        </View>
        <Link href="/(public)/price" asChild>
          <Button className="mt-6" testID="use-current-location">Use Current Location</Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}