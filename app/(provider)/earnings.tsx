import Badge from '@/components/ui/Badge';
import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CashNotice from '@/components/ui/CashNotice';
import MetricTile from '@/components/ui/MetricTile';
import StarRating from '@/components/ui/StarRating';
import StickyFooter, { stickyFooterContentPadding } from '@/components/ui/StickyFooter';
import { tid } from '@/lib/testing/testIDs';
import { useEarnings } from '@/lib/provider/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

export default function Earnings() {
    const insets = useSafeAreaInsets();
    const { earnings, totalEarnings } = useEarnings();

    const paidJobCount = earnings.reduce((count, entry) => count + (entry.cashReceived ? 1 : 0), 0);
    const hasEarnings = earnings.length > 0;

    const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatDate = (timestamp: number) => {
        return dateFormatter.format(new Date(timestamp));
    };

    const formatTime = (timestamp: number) =>
        new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

    const handleBackToHome = () => {
        router.replace('/(provider)/home');
    };

    const handleLearnMore = () => {
        Alert.alert(
            'Cash-only reminder',
            'Record every cash payout as soon as you receive it to keep your totals accurate.'
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: stickyFooterContentPadding(insets.bottom) }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-component pt-section pb-section gap-section">
                    <Card className="border-green-200 gap-tight bg-green-50">
                        <Text className="text-[12px] leading-[16px] font-semibold uppercase text-green-700">
                            Cash earnings
                        </Text>
                        <Text className="text-[28px] leading-[34px] font-extrabold text-green-700">
                            {formatCurrency(totalEarnings)} MAD
                        </Text>
                        <Text className="text-[16px] leading-[24px] text-green-800">
                            From {paidJobCount} paid {paidJobCount === 1 ? 'job' : 'jobs'} this period
                        </Text>
                    </Card>

                    <View className="flex-row gap-component">
                        <MetricTile label="Total jobs" value={earnings.length} tone="neutral" />
                        <MetricTile label="Paid jobs" value={paidJobCount} tone="success" />
                    </View>

                    <CashNotice testID={tid.provider.cashNotice.earnings} onLearnMore={handleLearnMore} />

                    {hasEarnings ? (
                        <View className="gap-component">
                            <View className="gap-minimal">
                                <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
                                    Recent jobs
                                </Text>
                                <Text className="text-[16px] leading-[24px] text-gray-700">
                                    Track what you earned and how each visit went.
                                </Text>
                            </View>

                            {earnings.map((earning) => {
                                const formattedDate = formatDate(earning.completedAt);
                                const formattedTime = formatTime(earning.completedAt);

                                return (
                                    <Card key={earning.id} className="gap-component">
                                        <View className="flex-row items-start justify-between gap-component">
                                            <View className="flex-1 gap-minimal">
                                                <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
                                                    {earning.customerName}
                                                </Text>
                                                <Text className="text-[16px] leading-[24px] text-gray-600">
                                                    {formattedDate} • {formattedTime}
                                                </Text>
                                            </View>
                                            <View className="items-end gap-tight">
                                                <Text className="text-[24px] leading-[32px] font-extrabold text-green-600">
                                                    {earning.price} MAD
                                                </Text>
                                                <Badge variant={earning.cashReceived ? 'success' : 'warn'}>
                                                    {earning.cashReceived ? 'Paid' : 'Pending'}
                                                </Badge>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center gap-tight">
                                            <Ionicons name="cash-outline" size={16} color="#047857" />
                                            <Text className="text-[16px] leading-[24px] text-gray-700">
                                                Job #{earning.jobId?.split('_').pop() ?? '—'}
                                            </Text>
                                        </View>

                                        {earning.rating && earning.rating > 0 && (
                                            <View className="flex-row items-center gap-tight">
                                                <StarRating rating={earning.rating} size={16} readonly />
                                                <Text className="text-[16px] leading-[24px] text-gray-600">
                                                    {earning.rating.toFixed(1)} • Customer rating
                                                </Text>
                                            </View>
                                        )}

                                        {earning.chips && earning.chips.length > 0 && (
                                            <View className="flex-row flex-wrap gap-tight">
                                                {earning.chips.map((chip, index) => (
                                                    <View
                                                        key={`${earning.id}-chip-${index}`}
                                                        className="border border-blue-200 rounded-full bg-blue-50 px-component py-tight"
                                                    >
                                                        <Text className="text-[13px] leading-[18px] text-blue-700">{chip}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </Card>
                                );
                            })}
                        </View>
                    ) : (
                        <Card className="items-center gap-component">
                            <View className="items-center justify-center w-16 h-16 rounded-full bg-blue-50">
                                <Ionicons name="receipt-outline" size={28} color="#2563eb" />
                            </View>
                            <Text className="text-[22px] leading-[28px] font-bold text-gray-900 text-center">
                                No earnings yet
                            </Text>
                            <Text className="text-center text-[16px] leading-[24px] text-gray-600">
                                Complete your first job to start building your daily cash totals.
                            </Text>
                            <Button onPress={handleBackToHome} variant="primary">
                                Start working
                            </Button>
                        </Card>
                    )}
                </View>
            </ScrollView>

            {hasEarnings && (
                <StickyFooter>
                    <Button
                        onPress={handleBackToHome}
                        variant="primary"
                        testID={tid.provider.earnings.continue}
                        accessibilityLabel="Continue working"
                    >
                        Continue working
                    </Button>
                </StickyFooter>
            )}
        </SafeAreaView>
    );
}
