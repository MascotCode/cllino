import { View } from 'react-native';
import { Link } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Title from '../../components/ui/Title';
import Subtitle from '../../components/ui/Subtitle';
import Button from '../../components/ui/Button';

export default function ConfirmScreen() {
  return (
    <Screen>
      <View className="px-4 py-6 flex-1">
        <Title>Provider assigned</Title>
        
        <View className="mt-4">
          <Subtitle>Pay cash after service</Subtitle>
        </View>
        
        <View className="flex-1 justify-end pb-6">
          <Link href="./rate" asChild>
            <Button variant="primary" testID="mark-complete">
              Mark complete
            </Button>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
