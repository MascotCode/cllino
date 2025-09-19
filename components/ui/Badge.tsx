import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type BadgeVariant = 'info' | 'success' | 'warn';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  testID?: string;
}

export default function Badge({ children, variant = 'info', className = '', testID }: BadgeProps) {
  const variants: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
    info: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-700' 
    },
    success: { 
      bg: 'bg-green-50', 
      border: 'border-green-200', 
      text: 'text-green-700' 
    },
    warn: { 
      bg: 'bg-orange-50', 
      border: 'border-orange-200', 
      text: 'text-orange-700' 
    }
  };

  const { bg, border, text } = variants[variant];

  return (
    <View className={`px-3 py-1 rounded-full border ${bg} ${border} ${className}`} testID={testID}>
      <Text className={`text-xs font-medium ${text}`}>
        {children}
      </Text>
    </View>
  );
}
