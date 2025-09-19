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
      className={`mt-auto bg-white border-t border-gray-200 shadow-sm px-4 pt-4 ${className}`}
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {children}
    </View>
  );
}
