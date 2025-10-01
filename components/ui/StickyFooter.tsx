import { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StickyFooterProps {
  children: ReactNode;
  className?: string;
}

export default function StickyFooter({ children, className = '' }: StickyFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className={`mt-auto border-t border-border-subtle bg-surface-0 px-5 pt-4 shadow-sheet ${className}`}
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {children}
    </View>
  );
}
