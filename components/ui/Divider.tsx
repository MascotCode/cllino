import { View } from 'react-native';

interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  const defaultClasses = 'h-[1px] bg-border-subtle my-2';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  return (
    <View className={combinedClasses} />
  );
}
