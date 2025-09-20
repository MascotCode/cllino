import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
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
    return Math.max(min, Math.min(absMax, rounded));
  };

  // Handle text input changes
  const onTextChange = (text: string) => {
    setInputText(text);
  };

  // Handle text input submit/blur
  const onTextSubmit = () => {
    const newValue = parseAndValidate(inputText);
    setInputText(newValue.toString());
    
    if (newValue === min && parseInt(inputText.replace(/[^\d]/g, '') || '0', 10) < min) {
      onClampMin?.();
    }
    
    onChange(newValue);
  };

  // Sync input text when value changes externally
  const currentValueStr = value.toString();
  if (inputText !== currentValueStr && !inputText.includes('.')) {
    setInputText(currentValueStr);
  }

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
        className={`w-10 h-10 rounded-full items-center justify-center ${
          value <= min
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
      <TextInput
        testID={`${testID}.input`}
        value={inputText}
        onChangeText={onTextChange}
        onSubmitEditing={onTextSubmit}
        onBlur={onTextSubmit}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={6}
        className="min-w-[80px] text-2xl font-bold text-blue-600 text-center px-2"
        style={{ textAlign: 'center' }}
      />

      {/* Increase Button */}
      <Pressable
        testID={`${testID}.inc`}
        onPressIn={() => startRepeat(handleIncrease)}
        onPressOut={stopRepeat}
        onTouchEnd={stopRepeat}
        hitSlop={10}
        className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center active:bg-blue-200"
      >
        <Ionicons name="add" size={18} color="#3B82F6" />
      </Pressable>
    </View>
  );
}
