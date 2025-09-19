import { Pressable, Text, View } from 'react-native';

export function SegmentPills({ items, value, onChange, testIDPrefix='segment' }: { items:{id:string;label:string}[]; value:string; onChange:(id:string)=>void; testIDPrefix?:string }) {
  return (
    <View className="flex-row gap-2">
      {items.map(it => {
        const active = value === it.id;
        return (
          <Pressable key={it.id} testID={`${testIDPrefix}-${it.id}`} onPress={() => onChange(it.id)} className={`${active ? 'bg-primary/10 border border-primary/30' : 'bg-surface-0 border border-border-subtle'} px-4 py-2 rounded-2xl`}>
            <Text className={active ? 'text-text-primary font-semibold' : 'text-text-secondary'}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}