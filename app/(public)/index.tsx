import { View } from 'react-native';
import { Link } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Title from '../../components/ui/Title';
import Button from '../../components/ui/Button';

export default function ServiceScreen() {
  return (
    <Screen>
      <View className="px-4 py-6">
        <Title>Choose Your Service</Title>
        
        <View className="flex-1 justify-center gap-3 mt-8">
          <Link href="./address" asChild>
            <Button variant="primary" testID="service-basic">
              Basic Cleaning
            </Button>
          </Link>

          <Link href="./address" asChild>
            <Button variant="primary" testID="service-deep">
              Deep Cleaning
            </Button>
          </Link>

          <Link href="./address" asChild>
            <Button variant="primary" testID="service-interior">
              Interior Detailing
            </Button>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
