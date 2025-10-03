import { Text, View } from 'react-native';

type StepKey = 'assigned' | 'onTheWay' | 'working' | 'completed';
export type PublicTimelineStep = {
  key: StepKey;
  title: string;
  description?: string;
  state: 'completed' | 'current' | 'pending';
};

export default function PublicJobTimeline({ steps }: { steps: PublicTimelineStep[] }) {
  return (
    <View className="mt-2">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const circleBase = 'w-7 h-7 rounded-full items-center justify-center';
        const rail = 'flex-1 ml-3';
        let circle = 'bg-gray-200';
        let title = 'text-gray-600';
        let line = 'bg-gray-200';

        if (s.state === 'completed') {
          circle = 'bg-blue-600';
          title = 'text-gray-700';
          line = 'bg-blue-200';
        } else if (s.state === 'current') {
          circle = 'bg-blue-500';
          title = 'text-gray-900 font-semibold';
          line = 'bg-blue-100';
        }

        const circleClass = [circleBase, circle].join(' ');
        const lineClass = [rail, line].join(' ');
        const titleClass = ['text-base', title].join(' ');

        return (
          <View key={s.key} className="flex-row">
            <View className="items-center">
              <View className={circleClass} testID={'pub.order.step-' + s.key}>
                <Text className="font-semibold text-white">{i + 1}</Text>
              </View>
              {!isLast && <View className={lineClass} style={{ width: 4, left: -5 }} />}
            </View>

            <View className="flex-1 pb-6 ml-4">
              <Text className={titleClass}>{s.title}</Text>
              {!!s.description && <Text className="mt-1 text-sm text-gray-500">{s.description}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}
