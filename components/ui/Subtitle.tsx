import { Text } from 'react-native';
import { ReactNode } from 'react';

interface SubtitleProps {
  children: ReactNode;
  className?: string;
}

export default function Subtitle({ children, className }: SubtitleProps) {
  const defaultClasses = 'text-sm text-zinc-500';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  return (
    <Text className={combinedClasses}>
      {children}
    </Text>
  );
}
