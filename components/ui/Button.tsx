import { forwardRef } from 'react';
import { Pressable, PressableProps, Text, View } from 'react-native';

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

export const Button = forwardRef<View, PressableProps & { variant?: Variant; size?: Size }>(
  ({ children, variant='primary', size='lg', className='', ...rest }, ref) => {
  const base = 'rounded-2xl items-center justify-center active:opacity-90';
  const sizes = size === 'md' ? 'h-11 px-4' : 'h-14 px-5';
  
  const variants: Record<Variant, string> = {
    primary: 'bg-primary shadow-press',
    subtle:  'bg-surface-100 border border-border-strong',
    ghost:   'bg-transparent',
    danger:  'bg-red-600'
  };
  
  const textColors: Record<Variant, string> = {
    primary: 'text-white',
    subtle:  'text-text-primary',
    ghost:   'text-text-primary',
    danger:  'text-white'
  };
    return (
      <Pressable ref={ref} className={`${base} ${sizes} ${variants[variant]} ${className}`} {...rest}>
        <Text className={`text-base font-semibold ${textColors[variant]}`}>{children as string}</Text>
      </Pressable>
    );
  }
);