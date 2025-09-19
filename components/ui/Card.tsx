import { View } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  const defaultClasses = 'rounded-2xl bg-white p-4 border border-zinc-100 shadow-sm';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  return (
    <View 
      className={combinedClasses}
      style={{ elevation: 1 }}
    >
      {children}
    </View>
  );
}
