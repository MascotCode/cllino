import { Text } from 'react-native';
import { ReactNode } from 'react';

interface TitleProps {
  children: ReactNode;
  className?: string;
}

export default function Title({ children, className }: TitleProps) {
  const defaultClasses = 'text-2xl font-semibold text-text-primary';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  return (
    <Text className={combinedClasses}>
      {children}
    </Text>
  );
}
