import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Title from '../../components/ui/Title';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function MatchingScreen() {
  return (
    <Screen>
      <View className="px-4 py-6">
        <Title>Finding your pro…</Title>
        
        <View className="gap-4 mt-8">
          <Card>
            <Text className="text-lg font-bold mb-1">John</Text>
            <Text className="text-sm text-zinc-500 mb-3">⭐ 4.8 • 2.1 km</Text>
            <Link href="./confirm" asChild>
              <Button variant="primary" testID="choose-provider-1">
                Choose
              </Button>
            </Link>
          </Card>

          <Card>
            <Text className="text-lg font-bold mb-1">Maria</Text>
            <Text className="text-sm text-zinc-500 mb-3">⭐ 4.6 • 3.0 km</Text>
            <Link href="./confirm" asChild>
              <Button variant="primary" testID="choose-provider-2">
                Choose
              </Button>
            </Link>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
