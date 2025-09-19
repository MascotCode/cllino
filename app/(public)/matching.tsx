import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import Badge from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Screen from '../../components/ui/Screen';
import Title from '../../components/ui/Title';
import { fmtMoney } from '../../utils/format';
import { getChevronIcon } from '../../utils/i18n';

// MOCK DATA
const PROVIDERS = [
  {
    id: 'john',
    name: 'John',
    rating: 4.8,
    distance: '2.1 km',
    eta: '5 min away',
    carType: 'Sedan',
    price: 120
  },
  {
    id: 'maria',
    name: 'Maria',
    rating: 4.6,
    distance: '3.0 km',
    eta: '8 min away',
    carType: 'SUV',
    price: 135
  }
];

export default function MatchingScreen() {
  return (
    <Screen>
      <View className="px-4 py-6 flex-1">
        <Title>Finding your pro…</Title>
        
        <View className="mt-8 gap-4">
          {PROVIDERS.map((provider) => (
            <Card key={provider.id} testID={`provider-card-${provider.id}`}>
              <View className="gap-4">
                {/* Provider Header */}
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-semibold text-gray-900">{provider.name}</Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <Text className="text-sm font-medium text-gray-900">{provider.rating}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="place" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-500">{provider.distance}</Text>
                      </View>
                    </View>
                  </View>
                  <Badge variant="info" testID={`eta-${provider.id}`}>
                    {provider.eta}
                  </Badge>
                </View>

                {/* Provider Details */}
                <View className="border-t border-gray-200 pt-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="car" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-500">{provider.carType}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="attach-money" size={16} color="#6b7280" />
                        <Text className="text-sm font-medium text-gray-900">
                          {fmtMoney(provider.price)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name={getChevronIcon()} size={20} color="#9ca3af" />
                  </View>
                </View>

                {/* Action Button */}
                <Link href="./confirm" asChild>
                  <Button 
                    variant="primary" 
                    testID={`choose-${provider.id}`}
                    className="w-full"
                  >
                    Choose {provider.name}
                  </Button>
                </Link>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}
