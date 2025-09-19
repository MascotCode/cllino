import { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
  testID?: string;
}

export default function Card({ children, className, testID }: CardProps) {
  const defaultClasses = 'rounded-2xl bg-surface-0 p-4 border border-border-subtle shadow-card';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  return (
    <View 
      className={combinedClasses}
      style={{ elevation: 1 }}
      testID={testID}
    >
      {children}
    </View>
  );
}
