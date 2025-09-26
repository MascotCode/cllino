import Badge from '@/components/ui/Badge';
import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';
import StickyFooter from '@/components/ui/StickyFooter';
import Title from '@/components/ui/Title';
import { useEarnings } from '@/lib/provider/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Earnings() {
    const { earnings, totalEarnings, refreshEarnings } = useEarnings();

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleBackToHome = () => {
        router.replace('/(provider)/home');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4 pt-8">
                <View className="mb-6">
                    <Title className="mb-4 text-center">Your Earnings</Title>
                </View>

                {/* Total Earnings */}
                <Card className="mb-6">
                    <View className="items-center py-6">
                        <Text className="mb-2 text-sm text-gray-600">Total Earnings</Text>
                        <Text className="mb-2 text-4xl font-bold text-green-600">
                            {totalEarnings} MAD
                        </Text>
                        <Text className="text-sm text-gray-500">
                            From {earnings.filter(e => e.cashReceived).length} completed {earnings.filter(e => e.cashReceived).length === 1 ? 'job' : 'jobs'}
                        </Text>
                    </View>
                </Card>

                {/* Stats Cards */}
                <View className="flex-row mb-6 space-x-3">
                    <Card className="flex-1 border-blue-200 bg-blue-50">
                        <View className="items-center py-4">
                            <Text className="text-2xl font-bold text-blue-600">
                                {earnings.length}
                            </Text>
                            <Text className="text-sm font-medium text-blue-700">
                                Total Jobs
                            </Text>
                        </View>
                    </Card>

                    <Card className="flex-1 border-green-200 bg-green-50">
                        <View className="items-center py-4">
                            <Text className="text-2xl font-bold text-green-600">
                                {earnings.filter(e => e.cashReceived).length}
                            </Text>
                            <Text className="text-sm font-medium text-green-700">
                                Paid Jobs
                            </Text>
                        </View>
                    </Card>
                </View>

                {/* Earnings List */}
                {earnings.length > 0 ? (
                    <View className="space-y-4">
                        <Text className="text-lg font-semibold text-gray-900">
                            Recent Jobs
                        </Text>

                        {earnings.map((earning) => (
                            <Card key={earning.id} className="space-y-3">
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-900">
                                            {earning.customerName}
                                        </Text>
                                        <Text className="text-sm text-gray-600">
                                            {formatDate(earning.completedAt)} • {formatTime(earning.completedAt)}
                                        </Text>
                                    </View>

                                    <View className="items-end">
                                        <Text className="text-xl font-bold text-green-600">
                                            {earning.price} MAD
                                        </Text>
                                        <Badge
                                            variant={earning.cashReceived ? 'success' : 'warn'}
                                        >
                                            {earning.cashReceived ? 'Paid' : 'Pending'}
                                        </Badge>
                                    </View>
                                </View>

                                {/* Customer Rating */}
                                {earning.rating && earning.rating > 0 && (
                                    <View className="flex-row items-center space-x-2">
                                        <Text className="text-sm text-gray-600">Customer rated:</Text>
                                        <StarRating
                                            rating={earning.rating}
                                            size={16}
                                            readonly
                                        />
                                        <Text className="text-sm text-gray-500">
                                            {earning.rating.toFixed(1)}
                                        </Text>
                                    </View>
                                )}

                                {/* Rating Chips */}
                                {earning.chips && earning.chips.length > 0 && (
                                    <View className="flex-row flex-wrap gap-2">
                                        {earning.chips.map((chip, index) => (
                                            <View
                                                key={index}
                                                className="px-3 py-1 border border-blue-200 rounded-full bg-blue-50"
                                            >
                                                <Text className="text-xs font-medium text-blue-700">
                                                    {chip}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </Card>
                        ))}
                    </View>
                ) : (
                    <Card className="mb-6">
                        <View className="items-center py-12">
                            <View className="items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                                <Ionicons name="receipt-outline" size={32} color="#6b7280" />
                            </View>
                            <Text className="mb-2 text-xl font-semibold text-gray-900">
                                No Earnings Yet
                            </Text>
                            <Text className="mb-6 text-center text-gray-600">
                                Complete your first job to start earning! Go online and wait for job invitations.
                            </Text>
                            <Button onPress={handleBackToHome} variant="primary">
                                Start Working
                            </Button>
                        </View>
                    </Card>
                )}

                {/* Cash reminder */}
                <Card className="bg-amber-50 border-amber-200">
                    <View className="flex-row items-start space-x-3">
                        <View className="w-6 h-6 bg-amber-500 rounded-full items-center justify-center mt-0.5">
                            <Ionicons name="cash" size={14} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="mb-1 font-medium text-amber-900">
                                Cash Payments Only
                            </Text>
                            <Text className="text-sm text-amber-800">
                                All payments are collected in cash on job completion. Keep track of your cash earnings for tax purposes.
                            </Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>

            {earnings.length > 0 && (
                <StickyFooter>
                    <Button
                        onPress={handleBackToHome}
                        variant="primary"
                    >
                        Continue Working
                    </Button>
                </StickyFooter>
            )}
        </SafeAreaView>
    );
}
