import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  className?: string;
  noSafeTop?: boolean;
}

export default function Screen({ children, className, noSafeTop = false }: ScreenProps) {
  const defaultClasses = 'flex-1 bg-surface-0';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  const safeAreaEdges = noSafeTop ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom'];
  
  return (
    <SafeAreaView className={combinedClasses} edges={safeAreaEdges as any}>
      {children}
    </SafeAreaView>
  );
}
