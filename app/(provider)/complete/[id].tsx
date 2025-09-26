import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';
import StickyFooter from '@/components/ui/StickyFooter';
import Title from '@/components/ui/Title';
import { useProviderState } from '@/lib/provider/store';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ratingChips = [
    'Friendly',
    'On time',
    'Easy to work with',
    'Good communication',
    'Respectful',
    'Clear instructions'
];

export default function CompleteJob() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [cashReceived, setCashReceived] = useState(false);
    const [rating, setRating] = useState(0);
    const [selectedChips, setSelectedChips] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const { activeJob, completeJob, refreshEarnings } = useProviderState();

    const toggleChip = (chip: string) => {
        setSelectedChips(prev =>
            prev.includes(chip)
                ? prev.filter(c => c !== chip)
                : [...prev, chip]
        );
    };

    const handleFinishJob = async () => {
        if (!activeJob || !cashReceived) {
            Alert.alert(
                'Cash Payment Required',
                'Please confirm that you have received the cash payment before completing the job.',
                [{ text: 'OK' }]
            );
            return;
        }

        setLoading(true);
        try {
            completeJob(activeJob.id, {
                cashReceived,
                rating: rating > 0 ? rating : undefined,
                chips: selectedChips,
            });

            // Refresh earnings data
            refreshEarnings();

            // Navigate to earnings screen
            router.replace('/(provider)/earnings');
        } catch (error) {
            console.error('Failed to complete job:', error);
            Alert.alert('Error', 'Failed to complete job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!activeJob || activeJob.id !== id) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="items-center justify-center flex-1 px-4">
                    <Card className="w-full">
                        <View className="items-center py-8">
                            <View className="items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
                                <Ionicons name="close-circle" size={32} color="#ef4444" />
                            </View>
                            <Text className="mb-2 text-xl font-semibold text-gray-900">
                                Job Not Found
                            </Text>
                            <Text className="mb-6 text-center text-gray-600">
                                This job is not active or has already been completed.
                            </Text>
                            <Button onPress={() => router.replace('/(provider)/home')} variant="primary">
                                Back to Home
                            </Button>
                        </View>
                    </Card>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4 pt-8">
                <View className="mb-6">
                    <Title className="mb-4 text-center">Complete Job</Title>
                </View>

                {/* Job Summary */}
                <Card className="mb-6">
                    <View className="space-y-4">
                        <View className="items-center">
                            <Text className="mb-2 text-2xl font-bold text-gray-900">
                                {activeJob.customerName}
                            </Text>
                            <View className="px-6 py-4 border border-green-200 bg-green-50 rounded-xl">
                                <Text className="text-3xl font-bold text-center text-green-600">
                                    {activeJob.price} MAD
                                </Text>
                                <Text className="font-medium text-center text-green-700">
                                    Service completed
                                </Text>
                            </View>
                        </View>

                        <View className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                            <View className="flex-row items-center mb-2 space-x-2">
                                <Ionicons name="location" size={16} color="#3b82f6" />
                                <Text className="font-medium text-blue-900">Service Location</Text>
                            </View>
                            <Text className="ml-6 text-sm text-blue-800">
                                {activeJob.exactAddress}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Cash Payment Confirmation */}
                <Card className="mb-6">
                    <View className="space-y-4">
                        <Text className="text-lg font-semibold text-gray-900">
                            Payment Confirmation
                        </Text>

                        <Pressable
                            onPress={() => { setCashReceived(!cashReceived); console.log('cashReceived', cashReceived); }}
                            className={`border-2 rounded-xl p-4 ${cashReceived
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-300'
                                }`}
                            testID="prov.complete.cash"
                        >
                            <View className="flex-row items-center space-x-3">
                                <View className={`w-6 h-6 rounded border-2 items-center justify-center ${cashReceived
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-400'
                                    }`}>
                                    {cashReceived && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </View>

                                <View className="flex-1">
                                    <Text className={`font-semibold ${cashReceived ? 'text-green-900' : 'text-gray-900'
                                        }`}>
                                        Cash payment received
                                    </Text>
                                    <Text className={`text-sm ${cashReceived ? 'text-green-700' : 'text-gray-600'
                                        }`}>
                                        Confirm that you have received {activeJob.price} MAD in cash
                                    </Text>
                                </View>

                                <Ionicons
                                    name="cash"
                                    size={24}
                                    color={cashReceived ? '#16a34a' : '#9ca3af'}
                                />
                            </View>
                        </Pressable>
                    </View>
                </Card>

                {/* Customer Rating */}
                <Card className="mb-6">
                    <View className="space-y-4">
                        <Text className="text-lg font-semibold text-gray-900">
                            Rate Your Customer (Optional)
                        </Text>

                        <View className="items-center py-4">
                            <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                size={40}
                                testIDPrefix="customer-rating"
                            />
                            {rating > 0 && (
                                <Text className="mt-2 text-gray-600">
                                    {rating} {rating === 1 ? 'star' : 'stars'}
                                </Text>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Rating Chips */}
                {rating > 0 && (
                    <Card className="mb-6">
                        <View className="space-y-4">
                            <Text className="text-lg font-semibold text-gray-900">
                                What made this customer great?
                            </Text>

                            <View className="flex-row flex-wrap gap-2">
                                {ratingChips.map((chip) => {
                                    const isSelected = selectedChips.includes(chip);

                                    return (
                                        <Pressable
                                            key={chip}
                                            onPress={() => toggleChip(chip)}
                                            className={`px-4 py-2 rounded-full border ${isSelected
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-gray-50 border-gray-300'
                                                }`}
                                        >
                                            <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                {chip}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </Card>
                )}

                {/* Warning if cash not confirmed */}
                {!cashReceived && (
                    <Card className="border-red-200 bg-red-50">
                        <View className="flex-row items-start space-x-3">
                            <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mt-0.5">
                                <Ionicons name="warning" size={14} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="mb-1 font-medium text-red-900">
                                    Payment Confirmation Required
                                </Text>
                                <Text className="text-sm text-red-800">
                                    Please confirm that you have received the cash payment before completing the job.
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
            </ScrollView>

            {/* Complete button */}
            <StickyFooter>
                <Button
                    onPress={handleFinishJob}
                    disabled={loading}
                    testID="prov.complete.finish"
                    className={cashReceived ? 'bg-blue-600 shadow-lg' : 'bg-gray-100 border border-gray-300'}
                >
                    {loading ? 'Completing...' : 'Finish Job'}
                </Button>
            </StickyFooter>
        </SafeAreaView>
    );
}
