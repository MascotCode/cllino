import * as React from 'react';
import { Pressable, PressableProps, Text } from 'react-native';

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

// Create a navigation-safe wrapper for the Button
const NavigationSafeButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps & { variant?: Variant; size?: Size; className?: string }
>(({ children, variant = 'primary', size = 'lg', className = '', ...rest }, ref) => {
  const base = 'rounded-2xl items-center justify-center active:opacity-90';
  const sizes = size === 'md' ? 'h-11 px-4' : 'h-14 px-5';

  const variants: Record<Variant, string> = {
    primary: 'bg-blue-600 shadow-lg',
    subtle: 'bg-gray-100 border border-gray-300',
    ghost: 'bg-transparent',
    danger: 'bg-red-600'
  };

  const textColors: Record<Variant, string> = {
    primary: 'text-white',
    subtle: 'text-gray-900',
    ghost: 'text-gray-900',
    danger: 'text-white'
  };

  // Wrap onPress to prevent navigation context errors
  const handlePress = React.useCallback((event: any) => {
    try {
      if (rest.onPress) {
        rest.onPress(event);
      }
    } catch (error) {
      // Silently handle navigation context errors
      if (error instanceof Error && error.message.includes('navigation context')) {
        console.warn('Navigation context error in AppButton:', error.message);
        return;
      }
      throw error;
    }
  }, [rest]);

  return (
    <Pressable
      ref={ref}
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...rest}
      onPress={handlePress}
    >
      <Text className={`text-base font-semibold ${textColors[variant]}`}>{children as string}</Text>
    </Pressable>
  );
});

NavigationSafeButton.displayName = 'NavigationSafeButton';

// Export as AppButton for consistency
export const AppButton = NavigationSafeButton;

// Keep legacy export for backward compatibility  
export const Button = AppButton;