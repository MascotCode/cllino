import Badge from '@/components/ui/Badge';
import { useOrdersStore, type PublicOrder } from '@/lib/public/ordersStore';
import { logInteraction } from '@/utils/analytics';
import { fmtMoney } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrdersSection = {
  title: string;
  key: 'active' | 'completed';
  data: PublicOrder[];
  emptyCopy: string;
  testID: string;
};

const formatTimeSnippet = (order: PublicOrder) => {
  const { whenLabel, slotStart, slotEnd } = order;

  if (whenLabel && slotStart && slotEnd) {
    return `${whenLabel}, ${slotStart} - ${slotEnd}`;
  }

  if (whenLabel) {
    return whenLabel;
  }

  if (slotStart && slotEnd) {
    return `${slotStart} - ${slotEnd}`;
  }

  return 'No time selected';
};

export default function OrdersScreen() {
  const router = useRouter();
  const { active, completed, addActive, completeOrder } = useOrdersStore((state) => ({
    active: state.active,
    completed: state.completed,
    addActive: state.addActive,
    completeOrder: state.completeOrder,
  }));

  const sections = useMemo<OrdersSection[]>(
    () => [
      {
        title: 'Active',
        key: 'active',
        data: [...active].sort((a, b) => b.createdAt - a.createdAt),
        emptyCopy: 'No active orders yet.',
        testID: 'pub.orders.active.section',
      },
      {
        title: 'Completed',
        key: 'completed',
        data: [...completed].sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt)),
        emptyCopy: 'No completed orders yet.',
        testID: 'pub.orders.completed.section',
      },
    ],
    [active, completed]
  );

  const handlePress = (order: PublicOrder, status: OrdersSection['key']) => {
    const elementId = status === 'active' ? `pub.orders.resume-${order.id}` : `pub.orders.receipt-${order.id}`;

    // Log analytics
    logInteraction({
      route: '/(public)/orders',
      elementId,
      meta: { orderId: order.id, status, service: order.serviceTitle }
    });

    if (status === 'active') {
      router.push({ pathname: '/(public)/confirm', params: { id: order.id } });
      return;
    }

    router.push({ pathname: '/(public)/orders/[id]', params: { id: order.id } });
  };

  const handleSeedDemo = () => {
    const now = Date.now();

    // Add 1 active order
    addActive({
      id: `active-${now}`,
      status: 'active',
      serviceTitle: 'Deep Cleaning',
      price: 150,
      durationMin: 90,
      address: '123 Demo Street, Casablanca',
      vehicle: { makeModel: 'Toyota Camry', plate: 'DEMO-123' },
      whenLabel: 'Today',
      slotStart: '14:00',
      slotEnd: '15:30',
      createdAt: now - 300000, // 5 minutes ago
    });

    // Add 2 completed orders (add as active first, then complete them)
    const completedOrder1Id = `completed-1-${now}`;
    addActive({
      id: completedOrder1Id,
      status: 'active',
      serviceTitle: 'Basic Wash',
      price: 80,
      durationMin: 45,
      address: '456 Test Avenue, Rabat',
      vehicle: { makeModel: 'Honda Civic', plate: 'TEST-456' },
      whenLabel: 'Yesterday',
      slotStart: '10:00',
      slotEnd: '10:45',
      createdAt: now - 86400000, // 1 day ago
    });

    const completedOrder2Id = `completed-2-${now}`;
    addActive({
      id: completedOrder2Id,
      status: 'active',
      serviceTitle: 'Premium Detail',
      price: 200,
      durationMin: 120,
      address: '789 Sample Road, Marrakech',
      vehicle: { makeModel: 'BMW X5', plate: 'SAMPLE-789' },
      whenLabel: '2 days ago',
      slotStart: '16:00',
      slotEnd: '18:00',
      createdAt: now - 172800000, // 2 days ago
    });

    // Complete the orders
    setTimeout(() => completeOrder(completedOrder1Id), 100);
    setTimeout(() => completeOrder(completedOrder2Id), 200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <SectionList<PublicOrder, OrdersSection>
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 32 }}
        ListHeaderComponent={() => (
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-900">Orders</Text>
                <Text className="text-sm text-gray-500 mt-1">Review your active and past jobs</Text>
              </View>
              {__DEV__ && (
                <Pressable
                  onPress={handleSeedDemo}
                  testID="pub.orders.seed"
                  className="rounded-lg bg-blue-100 px-3 py-2"
                >
                  <Text className="text-xs font-medium text-blue-700">Seed demo</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View
            className={`flex-row items-center justify-between ${section.key === 'active' ? 'mt-2' : 'mt-8'} mb-3`}
            testID={section.testID}
          >
            <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {section.title}
            </Text>
            <View className="h-px flex-1 bg-gray-200 ml-3" />
          </View>
        )}
        renderSectionFooter={({ section }) =>
          section.data.length ? null : (
            <View className="mb-6 items-center justify-center py-8">
              <Text className="text-sm text-gray-500" testID={section.key === 'active' ? 'pub.orders.empty-active' : 'pub.orders.empty-completed'}>
                {section.emptyCopy}
              </Text>
            </View>
          )
        }
        renderItem={({ item, section }) => {
          const isActive = section.key === 'active';
          const pressTestID = isActive
            ? `pub.orders.resume-${item.id}`
            : `pub.orders.receipt-${item.id}`;

          return (
            <View className="mb-3">
              <Pressable
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
                onPress={() => handlePress(item, section.key)}
                testID={pressTestID}
              >
                <View className="flex-row items-start justify-between" testID={`pub.orders.item-${item.id}`}>
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                      {item.serviceTitle}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-1">
                      <Ionicons name="time-outline" size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-500" numberOfLines={1}>
                        {formatTimeSnippet(item)}
                      </Text>
                    </View>
                    <View className="mt-1 flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-500" numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end gap-2">
                    <Text className="text-sm font-semibold text-gray-900">{fmtMoney(item.price)}</Text>
                    <Badge variant={isActive ? 'info' : 'success'}>
                      {isActive ? 'Active' : 'Completed'}
                    </Badge>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
