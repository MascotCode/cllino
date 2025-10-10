import { ReactNode, useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform, View, type KeyboardEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StickyFooterProps {
  children: ReactNode;
  className?: string;
}

export default function StickyFooter({ children, className = '' }: StickyFooterProps) {
  const insets = useSafeAreaInsets();
  const desiredGap = 64;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const basePadding = Math.max(insets.bottom, 16) + 4;
  const keyboardPadding =
    Platform.OS === 'android' && keyboardHeight > 0
      ? Math.min(basePadding, desiredGap + 4)
      : basePadding;
  const keyboardMargin =
    Platform.OS === 'android' && keyboardHeight > 0
      ? Math.max(0, keyboardHeight - desiredGap)
      : 0;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    let mounted = true;

    const toHeight = (event: KeyboardEvent) => {
      if (!mounted) {
        return;
      }

      const height =
        event.endCoordinates && typeof event.endCoordinates.height === 'number'
          ? event.endCoordinates.height
          : Math.max(
            0,
            Dimensions.get('screen').height -
            (event.endCoordinates && typeof event.endCoordinates.screenY === 'number'
              ? event.endCoordinates.screenY
              : Dimensions.get('screen').height)
          );

      setKeyboardHeight(height);
    };

    const resetHeight = () => {
      if (!mounted) {
        return;
      }
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener('keyboardDidShow', toHeight);
    const changeSub = Keyboard.addListener('keyboardDidChangeFrame', toHeight);
    const hideSub = Keyboard.addListener('keyboardDidHide', resetHeight);

    return () => {
      mounted = false;
      showSub.remove();
      changeSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View
      className={`mt-auto border-t border-border-subtle bg-surface-0 px-5 pt-4 shadow-sheet ${className}`}
      style={{
        paddingBottom: keyboardPadding,
        marginBottom: keyboardMargin,
      }}
      accessibilityRole="summary"
      accessibilityLabel="Sticky footer actions"
      testID="ui.stickyFooter"
    >
      {children}
    </View>
  );
}

export const stickyFooterContentPadding = (bottomInset: number, extra: number = 120) =>
  bottomInset + extra;
