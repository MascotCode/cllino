import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Badge from '@/components/ui/Badge';
import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SegmentPills } from '@/components/ui/SegmentPills';
import StickyFooter from '@/components/ui/StickyFooter';
import Title from '@/components/ui/Title';
import { impact } from '@/lib/haptics';
import { useCheckoutStore } from '@/lib/public/checkoutStore';
import { generateSlots, type Slot } from '@/lib/time/slots';

// Constants
const TIMEZONE = 'Africa/Casablanca';
const HOURS = { start: 9, end: 21 };
const STEP_MIN = 30;
const LEAD_MIN = 15;
const ETA_RANGE = '≈15–25 min';

export default function TimeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const setOrder = useCheckoutStore((state) => state.setOrder);
  const flatListRef = useRef<FlatList>(null);

  // State
  const [mode, setMode] = useState<'now' | 'today'>('now');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Generate slots when mode switches to 'today'
  useEffect(() => {
    if (mode === 'today') {
      const todaySlots = generateSlots({
        date: new Date(),
        startHour: HOURS.start,
        endHour: HOURS.end,
        stepMin: STEP_MIN,
        leadMin: LEAD_MIN,
        timeZone: TIMEZONE,
      });
      setSlots(todaySlots);
      setSelectedId(null);
    }
  }, [mode]);

  // Auto-scroll to first enabled slot
  useEffect(() => {
    if (mode === 'today' && slots.length > 0) {
      // Small delay to ensure FlatList is rendered
      const timeoutId = setTimeout(() => {
        const firstEnabledIdx = slots.findIndex(s => !s.disabled);
        if (firstEnabledIdx >= 0 && flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({
              index: firstEnabledIdx,
              animated: true
            });
          } catch (error) {
            // Fallback if scrollToIndex fails
            console.warn('Auto-scroll failed:', error);
          }
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [slots, mode]);

  const handleModeChange = (newMode: string) => {
    setMode(newMode as 'now' | 'today');
  };

  const handleSlotSelect = (slotId: string) => {
    if (mode === 'today') {
      const slot = slots.find(s => s.id === slotId);
      if (slot && !slot.disabled) {
        setSelectedId(slotId);
        impact(); // Haptic feedback
      }
    }
  };

  const handleContinue = () => {
    const existingParams = new URLSearchParams();

    // Preserve existing search params
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        existingParams.append(key, value);
      }
    });

    if (mode === 'now') {
      existingParams.set('when', 'now');
      existingParams.delete('slotStart');
      existingParams.delete('slotEnd');
      setOrder({ time: { whenLabel: 'Now', fallbackLabel: 'Now' } });
      router.push(`./price?${existingParams.toString()}`);
    } else if (mode === 'today' && selectedId) {
      const selectedSlot = slots.find(s => s.id === selectedId);
      if (selectedSlot) {
        const startDate = new Date(selectedSlot.startISO);
        const endDate = new Date(startDate.getTime() + STEP_MIN * 60 * 1000);
        const formatTime = (date: Date) =>
          new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
        const slotStartLabel = formatTime(startDate);
        const slotEndLabel = formatTime(endDate);

        setOrder({
          time: {
            whenLabel: 'Today',
            slotStart: slotStartLabel,
            slotEnd: slotEndLabel,
            fallbackLabel: `${slotStartLabel} - ${slotEndLabel}`,
          },
        });

        existingParams.set('when', 'schedule');
        existingParams.set('slotStart', selectedSlot.startISO);
        router.push(`./price?${existingParams.toString()}`);
      }
    }
  };

  const canContinue = mode === 'now' || (mode === 'today' && selectedId !== null);
  const hasAvailableSlots = slots.some(s => !s.disabled);

  const renderSlot = ({ item }: { item: Slot }) => {
    const isSelected = selectedId === item.id;
    const isDisabled = item.disabled;

    return (
      <Pressable
        testID={`time.slot-${item.id}`}
        onPress={() => handleSlotSelect(item.id)}
        disabled={isDisabled}
        accessibilityState={{ disabled: isDisabled }}
        className={`
          flex-1 min-h-[48px] mx-1 mb-2 px-3 py-2 rounded-xl border items-center justify-center
          ${isDisabled
            ? 'bg-gray-50 border-gray-100 opacity-50'
            : isSelected
              ? 'bg-blue-50 border-blue-300'
              : 'bg-white border-gray-200'
          }
        `}
      >
        <Text
          className={`
            text-sm text-center
            ${isDisabled
              ? 'text-gray-400'
              : isSelected
                ? 'text-blue-700 font-semibold'
                : 'text-gray-900'
            }
          `}
        >
          {item.display}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 py-6" testID="time.title">
        <Title>Choose Time</Title>
      </View>

      {/* Mode Selection */}
      <View className="px-4 mb-6">
        <SegmentPills
          testIDPrefix="time.seg"
          items={[
            { id: 'now', label: 'Now' },
            { id: 'today', label: 'Today' },
          ]}
          value={mode}
          onChange={handleModeChange}
        />
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {mode === 'now' ? (
          <Card>
            <View className="items-center py-4">
              <Badge variant="success" className="mb-3">
                {ETA_RANGE}
              </Badge>
              <Text className="text-base leading-6 text-center text-gray-600">
                We'll start as soon as possible
              </Text>
            </View>
          </Card>
        ) : (
          <View className="flex-1">
            {!hasAvailableSlots ? (
              <Card>
                <View className="items-center py-6">
                  <Text className="text-base leading-6 text-center text-gray-700">
                    No slots left today. Please choose Now or try earlier tomorrow.
                  </Text>
                </View>
              </Card>
            ) : (
              <FlatList
                ref={flatListRef}
                data={slots}
                renderItem={renderSlot}
                keyExtractor={(item) => item.id}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                onScrollToIndexFailed={(info) => {
                  // Handle scroll failure gracefully
                  console.warn('Scroll to index failed:', info);
                }}
              />
            )}
          </View>
        )}
      </View>

      {/* Footer */}
      <StickyFooter>
        <Button
          testID="time.continue"
          onPress={handleContinue}
          disabled={!canContinue}
          className={!canContinue ? 'opacity-50' : ''}
        >
          Continue
        </Button>
      </StickyFooter>
    </View>
  );
}