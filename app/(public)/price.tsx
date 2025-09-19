import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Title from '../../components/ui/Title';
import Subtitle from '../../components/ui/Subtitle';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function PriceScreen() {
  return (
    <Screen>
      <View className="px-4 py-6 flex-1">
        <Title>Suggested price</Title>
        
        <View className="items-center mb-8">
          <Text className="text-5xl font-extrabold text-blue-600 my-6">$27</Text>
          <Card>
            <Text className="text-center">💵 Cash on completion</Text>
          </Card>
        </View>
        
        <View className="flex-1 justify-end">
          <View className="px-4 pb-6">
            <Link href="./matching" asChild>
              <Button variant="primary" testID="confirm-price" className="w-full">
                Confirm
              </Button>
            </Link>
          </View>
        </View>
      </View>
    </Screen>
  );
}
