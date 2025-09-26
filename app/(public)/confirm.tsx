import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/ui/Badge';
import { AppButton as Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';

// MOCK DATA
const ASSIGNED_PROVIDER = {
  id: 'john',
  name: 'John',
  rating: 4.8,
  carType: 'Toyota Camry',
  plate: 'ABC-123',
  eta: '15:20',
  currentStatus: 'On the way'
};

const TIMELINE_STEPS = [
  { label: 'Assigned', completed: true },
  { label: 'On the way', completed: true },
  { label: 'Arrives 15:20', completed: false }
];

export default function ConfirmScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View className="px-4 py-6 flex-1">
        <Title>Provider assigned</Title>

        {/* Provider Status Card */}
        <View className="mt-8">
          <Card testID={`provider-card-${ASSIGNED_PROVIDER.id}`}>
            <View className="gap-4">
              {/* Provider Info */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">{ASSIGNED_PROVIDER.name}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text className="text-sm font-medium text-gray-900">{ASSIGNED_PROVIDER.rating}</Text>
                  </View>
                </View>
                <Badge variant="success" testID={`eta-${ASSIGNED_PROVIDER.id}`}>
                  ETA {ASSIGNED_PROVIDER.eta}
                </Badge>
              </View>

              {/* Car Details */}
              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="car" size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-500">{ASSIGNED_PROVIDER.carType}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="crop-landscape" size={16} color="#6b7280" />
                    <Text className="text-sm font-medium text-gray-900">{ASSIGNED_PROVIDER.plate}</Text>
                  </View>
                </View>
              </View>

              {/* Payment Info */}
              <View className="bg-gray-50 rounded-lg p-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="cash" size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-500">Pay cash after service</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Timeline */}
        <View className="mt-6">
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-gray-900">Status</Text>
              <View className="border-t border-gray-200 pt-3">
                <View className="relative">
                  <View className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" />
                  <View className="flex-row justify-between">
                    {TIMELINE_STEPS.map((step, index) => (
                      <View key={step.label} className="items-center">
                        <View className={`w-6 h-6 rounded-full border-2 ${step.completed
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                          } items-center justify-center`}>
                          {step.completed && (
                            <Ionicons name="checkmark" size={14} color="white" />
                          )}
                        </View>
                        <Text className={`text-xs mt-2 text-center max-w-16 ${step.completed ? 'text-blue-600 font-medium' : 'text-gray-500'
                          }`}>
                          {step.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </View>

      {/* Sticky Footer */}
      <StickyFooter>
        <Link href="./rate" asChild>
          <Button variant="primary" testID="mark-complete" className="w-full">
            Mark complete
          </Button>
        </Link>
      </StickyFooter>
    </SafeAreaView>
  );
}
