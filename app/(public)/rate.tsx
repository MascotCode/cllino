import { View } from 'react-native';
import Screen from '../../components/ui/Screen';
import Title from '../../components/ui/Title';
import Subtitle from '../../components/ui/Subtitle';

export default function RateScreen() {
  return (
    <Screen>
      <View className="px-4 py-6">
        <Title>Rate your wash: ★★★★★</Title>
        
        <View className="mt-4">
          <Subtitle>Thank you for using our service!</Subtitle>
        </View>
      </View>
    </Screen>
  );
}
