import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
  className?: string;
}

export default function Screen({ children, className }: ScreenProps) {
  const defaultClasses = 'flex-1 bg-white';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  return (
    <SafeAreaView className={combinedClasses}>
      {children}
    </SafeAreaView>
  );
}
