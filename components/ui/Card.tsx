import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  testID?: string;
}

export default function Card({ children, className, testID, style, ...rest }: CardProps) {
  const defaultClasses = 'rounded-2xl bg-surface-0 p-component border border-border-subtle shadow-card';
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;

  return (
    <View
      className={combinedClasses}
      style={[{ elevation: 1 }, style]}
      testID={testID}
      {...rest}
    >
      {children}
    </View>
  );
}
