import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton as Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StarRating from '../../components/ui/StarRating';
import StickyFooter from '../../components/ui/StickyFooter';
import Title from '../../components/ui/Title';

// MOCK DATA
const RATING_CHIPS = [
  { id: 'speed', label: 'Speed' },
  { id: 'quality', label: 'Quality' },
  { id: 'friendliness', label: 'Friendliness' },
  { id: 'value', label: 'Great Value' },
  { id: 'professional', label: 'Professional' }
];

const RATING_LABELS = {
  1: 'Poor',
  2: 'Okay',
  3: 'Good',
  4: 'Great!',
  5: 'Excellent!'
};

export default function RateScreen() {
  const [starRating, setStarRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  const toggleChip = (chipId: string) => {
    setSelectedChips(prev =>
      prev.includes(chipId)
        ? prev.filter(id => id !== chipId)
        : [...prev, chipId]
    );
  };

  const handleSubmit = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Title>Rate your service</Title>

          {/* Star Rating */}
          <View className="mt-8">
            <Card>
              <View className="items-center gap-4">
                <Text className="text-lg font-semibold text-gray-900">How was your experience?</Text>
                <StarRating
                  rating={starRating}
                  onRatingChange={setStarRating}
                  size={40}
                  testIDPrefix="star"
                />
                {starRating > 0 && (
                  <Text className="text-sm text-gray-500">
                    {RATING_LABELS[starRating as keyof typeof RATING_LABELS]}
                  </Text>
                )}
              </View>
            </Card>
          </View>

          {/* Quick Feedback Chips */}
          <View className="mt-6">
            <Card>
              <View className="gap-4">
                <Text className="text-lg font-semibold text-gray-900">What did you like?</Text>
                <View className="pt-3 border-t border-gray-200">
                  <View className="flex-row flex-wrap gap-2">
                    {RATING_CHIPS.map((chip) => {
                      const isSelected = selectedChips.includes(chip.id);
                      return (
                        <Pressable
                          key={chip.id}
                          onPress={() => toggleChip(chip.id)}
                          className={`px-4 py-2 rounded-full border transition-colors ${isSelected
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200'
                            }`}
                          testID={`chip-${chip.id}`}
                        >
                          <Text className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                            {chip.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Comments */}
          <View className="mt-6">
            <Card>
              <View className="gap-3">
                <Text className="text-lg font-semibold text-gray-900">Additional feedback</Text>
                <View className="pt-3 border-t border-gray-200">
                  <TextInput
                    className="bg-gray-50 rounded-lg p-4 min-h-[80px] border border-gray-200 text-gray-900"
                    placeholder="Tell us more... (optional)"
                    placeholderTextColor="#6B7280"
                    multiline
                    textAlignVertical="top"
                    value={feedback}
                    onChangeText={setFeedback}
                    testID="feedback-input"
                  />
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Footer */}
      <StickyFooter>
        <Button
          variant="primary"
          testID="submit-rating"
          className="w-full"
          onPress={handleSubmit}
        >
          Submit rating
        </Button>
      </StickyFooter>
    </SafeAreaView>
  );
}
