import { Pressable, Text, PressableProps } from 'react-native';

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

export function Button({ children, variant='primary', size='lg', className='', ...rest }: PressableProps & { variant?: Variant; size?: Size }) {
  const base = 'rounded-2xl items-center justify-center active:opacity-90';
  const sizes = size === 'md' ? 'h-11 px-4' : 'h-14 px-5';
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-text-inverse shadow-press',
    subtle:  'bg-surface-100 text-text-primary border border-border-strong',
    ghost:   'bg-transparent text-text-primary',
    danger:  'bg-red-600 text-text-inverse'
  };
  return (
    <Pressable className={`${base} ${sizes} ${variants[variant]} ${className}`} {...rest}>
      <Text className="text-base font-semibold">{children as string}</Text>
    </Pressable>
  );
}