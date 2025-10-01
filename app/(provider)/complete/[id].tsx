import Card from '@/components/ui/Card';
import { AppButton as Button } from '@/components/ui/Button';
import NoticeBanner from '@/components/ui/NoticeBanner';
import StarRating from '@/components/ui/StarRating';
import StickyFooter from '@/components/ui/StickyFooter';
import { useProviderState } from '@/lib/provider/store';
import { tid } from '@/lib/testing/testIDs';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ratingChips = ['Friendly', 'On time', 'Easy to work with', 'Good communication', 'Respectful', 'Clear instructions'];

export default function CompleteJob() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cashReceived, setCashReceived] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const { activeJob, completeJob, refreshEarnings } = useProviderState();

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) => (prev.includes(chip) ? prev.filter((item) => item !== chip) : [...prev, chip]));
  };

  const handleFinishJob = async () => {
    if (!activeJob || !cashReceived) {
      Alert.alert('Cash payment required', 'Confirm that you received cash before finishing the job.', [{ text: 'OK' }]);
      return;
    }

    setLoading(true);
    try {
      completeJob(activeJob.id, {
        cashReceived,
        rating: rating > 0 ? rating : undefined,
        chips: selectedChips
      });

      refreshEarnings();
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
        <View className="flex-1 items-center justify-center px-component">
          <Card className="w-full max-w-md items-center gap-component">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <Ionicons name="close-circle" size={30} color="#e11d48" />
            </View>
            <Text className="text-[22px] leading-[28px] font-bold text-gray-900 text-center">
              Job not found
            </Text>
            <Text className="text-center text-[16px] leading-[24px] text-gray-600">
              This job is not active or has already been completed.
            </Text>
            <Button onPress={() => router.replace('/(provider)/home')} variant="primary">
              Back to home
            </Button>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-component pt-section pb-section gap-section">
          <Card className="gap-component">
            <Text className="text-[12px] leading-[16px] font-semibold uppercase text-green-600">
              Complete job
            </Text>
            <View className="gap-tight">
              <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
                {activeJob.customerName}
              </Text>
              <Text className="text-[16px] leading-[24px] text-gray-700">
                Collect your payment to close out the visit.
              </Text>
            </View>
            <View className="rounded-2xl border border-green-200 bg-green-50 px-component py-component gap-tight">
              <Text className="text-[28px] leading-[34px] font-extrabold text-green-600">
                {activeJob.price} MAD
              </Text>
              <Text className="text-[16px] leading-[24px] text-green-700">
                Cash owed to you by the customer
              </Text>
            </View>
          </Card>

          <Card className="gap-component">
            <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
              Payment confirmation
            </Text>
            <Pressable
              onPress={() => setCashReceived((prev) => !prev)}
              className={`flex-row items-center justify-between rounded-2xl border px-component py-component ${cashReceived ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: cashReceived }}
              accessibilityLabel="Cash payment received"
              accessibilityHint={`Toggle to confirm you collected ${activeJob.price} MAD in cash`}
              testID={tid.provider.complete.cash}
            >
              <View className="flex-1 pr-component gap-tight">
                <Text className="text-[16px] leading-[24px] font-semibold text-gray-900">
                  Cash payment received
                </Text>
                <Text className={`text-[16px] leading-[24px] ${cashReceived ? 'text-green-700' : 'text-gray-600'}`}>
                  Confirm that you have received {activeJob.price} MAD from the customer.
                </Text>
              </View>
              <View className={`h-10 w-10 items-center justify-center rounded-full ${cashReceived ? 'bg-green-600' : 'bg-white border border-gray-300'}`}>
                <Ionicons name={cashReceived ? 'checkmark' : 'cash-outline'} size={20} color={cashReceived ? 'white' : '#4b5563'} />
              </View>
            </Pressable>

            {!cashReceived && (
              <NoticeBanner
                tone="danger"
                title="Cash confirmation required"
                body="You must confirm that you received the cash payment before you can finish this job."
              />
            )}
          </Card>

          <Card className="gap-component">
            <View className="items-center gap-tight">
              <Text className="text-[18px] leading-[24px] font-semibold text-gray-900">
                Rate your customer (optional)
              </Text>
              <StarRating rating={rating} onRatingChange={setRating} size={34} testIDPrefix="customer-rating" />
              {rating > 0 && (
                <Text className="text-[16px] leading-[24px] text-gray-600">
                  {rating} {rating === 1 ? 'star' : 'stars'} selected
                </Text>
              )}
            </View>

            {rating > 0 && (
              <View className="flex-row flex-wrap gap-tight">
                {ratingChips.map((chip) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <Pressable
                      key={chip}
                      onPress={() => toggleChip(chip)}
                      className={`rounded-full border px-component py-tight ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-blue-200 bg-blue-50'}`}
                    >
                      <Text className={`text-[14px] leading-[20px] font-medium ${isSelected ? 'text-white' : 'text-blue-700'}`}>
                        {chip}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>

      <StickyFooter>
        <Button
          onPress={handleFinishJob}
          disabled={!cashReceived || loading}
          testID={tid.provider.complete.finish}
          variant="primary"
        >
          {loading ? 'Finishing…' : 'Finish job'}
        </Button>
      </StickyFooter>
    </SafeAreaView>
  );
}
