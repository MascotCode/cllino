import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { roundTo5 } from '../../utils/pricing';

export interface AmountInputProps {
  value: number;            // MAD integer
  step?: number;            // default 5
  min: number;
  typicalMax: number;
  absMax: number;
  onChange: (next: number) => void;
  onClampMin?: () => void;  // toast hook
  onExceedAbsMax?: (proposed: number) => void; // show confirm
  testID?: string;
}

export default function AmountInput({
  value,
  step = 5,
  min,
  typicalMax,
  absMax,
  onChange,
  onClampMin,
  onExceedAbsMax,
  testID = 'amount-input',
}: AmountInputProps) {
  const [inputText, setInputText] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper to clean up timers
  const clearTimers = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (repeatTimer.current) {
      clearInterval(repeatTimer.current);
      repeatTimer.current = null;
    }
  };

  // Parse and validate input
  const parseAndValidate = (text: string): number => {
    const cleaned = text.replace(/[^\d]/g, ''); // Strip non-digits
    const parsed = parseInt(cleaned || '0', 10);
    const rounded = roundTo5(parsed);

    // Only enforce minimum, let absMax check happen in onTextSubmit
    return Math.max(min, rounded);
  };

  // Handle text input changes
  const onTextChange = (text: string) => {
    setInputText(text);
    setIsEditing(true);
  };

  // Handle text input submit/blur
  const onTextSubmit = () => {
    const cleaned = inputText.replace(/[^\d]/g, '');
    const parsed = parseInt(cleaned || '0', 10);
    const proposedValue = Math.max(min, parsed);

    setIsEditing(false);

    // Check for absMax exceedance BEFORE capping
    if (proposedValue > absMax) {
      onExceedAbsMax?.(proposedValue);
      // Don't reset the input - let the parent component handle the modal and decision
      return;
    }

    // Check for minimum clamp
    if (proposedValue === min && parsed < min) {
      onClampMin?.();
    }

    setInputText(proposedValue.toString());
    onChange(proposedValue);
  };

  // Handle text input focus
  const onTextFocus = () => {
    setIsEditing(true);
  };

  // Sync input text when value changes externally (but not when user is editing)
  useEffect(() => {
    if (!isEditing) {
      setInputText(value.toString());
    }
  }, [value, isEditing]);

  // Optimized haptics - non-blocking
  const triggerHaptics = useCallback(() => {
    // Use setTimeout to make haptics non-blocking
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Silent fail for haptics
      });
    }, 0);
  }, []);

  // Decrease handler
  const handleDecrease = useCallback(() => {
    const proposed = value - step;
    const newValue = Math.max(min, proposed);

    if (newValue === min && proposed < min) {
      onClampMin?.();
    } else {
      triggerHaptics();
    }

    setIsEditing(false); // Mark as not editing since this is programmatic
    onChange(newValue);
    setInputText(newValue.toString());
  }, [value, step, min, onChange, onClampMin, triggerHaptics]);

  // Increase handler
  const handleIncrease = useCallback(() => {
    const proposed = value + step;

    if (proposed > absMax) {
      onExceedAbsMax?.(proposed);
      return;
    }

    setIsEditing(false); // Mark as not editing since this is programmatic
    triggerHaptics();
    onChange(proposed);
    setInputText(proposed.toString());
  }, [value, step, absMax, onChange, onExceedAbsMax, triggerHaptics]);

  // Long press repeat functionality
  const startRepeat = useCallback((action: () => void) => {
    clearTimers(); // Clear any existing timers
    action(); // Execute immediately on press down

    longPressTimer.current = setTimeout(() => {
      repeatTimer.current = setInterval(() => {
        action();
      }, 120); // Faster repeat for smooth experience
    }, 500); // Shorter delay before repeat starts
  }, []);

  const stopRepeat = useCallback(() => {
    clearTimers();
  }, []);

  return (
    <View testID={testID} className="flex-row items-center gap-2">
      {/* Decrease Button */}
      <Pressable
        testID={`${testID}.dec`}
        onPressIn={() => startRepeat(handleDecrease)}
        onPressOut={stopRepeat}
        onTouchEnd={stopRepeat}
        hitSlop={10}
        className={`w-10 h-10 rounded-full items-center justify-center ${value <= min
          ? 'bg-gray-100'
          : 'bg-blue-100 active:bg-blue-200'
          }`}
        disabled={value <= min}
      >
        <Ionicons
          name="remove"
          size={18}
          color={value <= min ? '#9CA3AF' : '#3B82F6'}
        />
      </Pressable>

      {/* Text Input */}
      <BottomSheetTextInput
        testID={`${testID}.input`}
        value={inputText}
        onChangeText={onTextChange}
        onFocus={onTextFocus}
        onSubmitEditing={onTextSubmit}
        onBlur={onTextSubmit}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={6}
        className="min-w-[80px] text-3xl font-bold text-blue-600 text-center px-2"
        style={{ textAlign: 'center' }}
      />
      {/* Increase Button */}
      <Pressable
        testID={`${testID}.inc`}
        onPressIn={() => startRepeat(handleIncrease)}
        onPressOut={stopRepeat}
        onTouchEnd={stopRepeat}
        hitSlop={10}
        className="items-center justify-center w-10 h-10 bg-blue-100 rounded-full active:bg-blue-200"
      >
        <Ionicons name="add" size={18} color="#3B82F6" />
      </Pressable>
    </View>
  );
}