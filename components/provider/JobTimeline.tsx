import { Text, View, ViewStyle } from 'react-native';

type StepKey = 'assigned' | 'onTheWay' | 'working' | 'completed';

export type TimelineStep = {
  key: StepKey;
  title: string;
  description?: string;
  state: 'completed' | 'current' | 'pending';
};

export default function JobTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View className="pt-1">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const rowClasses = ['flex-row', 'min-h-[48px]'];
        if (!isLast) {
          rowClasses.push('pb-6');
        }

        const circleBase = 'w-12 h-12 rounded-full items-center justify-center';
        let circleClasses = `${circleBase} bg-white border border-gray-300`;
        let circleTextClass = 'text-[16px] font-semibold text-gray-500';
        let titleClass = 'text-[16px] leading-[24px] font-semibold text-gray-600';
        let descriptionClass = 'text-[14px] leading-[20px] text-gray-500 mt-1';

        if (step.state === 'completed') {
          circleClasses = `${circleBase} bg-blue-600`;
          circleTextClass = 'text-[16px] font-semibold text-white';
          titleClass = 'text-[16px] leading-[24px] font-semibold text-gray-700';
          descriptionClass = 'text-[14px] leading-[20px] text-gray-500 mt-1';
        } else if (step.state === 'current') {
          circleClasses = `${circleBase} bg-blue-500 border-2 border-blue-300`;
          circleTextClass = 'text-[16px] font-bold text-white';
          titleClass = 'text-[16px] leading-[24px] font-bold text-blue-700';
          descriptionClass = 'text-[14px] leading-[20px] text-blue-600 mt-1';
        }

        const baseLineStyle: ViewStyle = {
          flex: 1,
          marginTop: 8,
          alignSelf: 'center',
        };

        const lineStateStyle: ViewStyle =
          step.state === 'pending'
            ? {
                borderLeftWidth: 2,
                borderStyle: 'dashed',
                borderColor: '#d4d4d8',
              }
            : {
                width: 2,
                backgroundColor: '#2563eb',
                borderRadius: 9999,
              };

        return (
          <View key={step.key} className={rowClasses.join(' ')}>
            <View className="items-center">
              <View testID={`prov.job.step-${step.key}`} className={circleClasses}>
                <Text className={circleTextClass}>{index + 1}</Text>
              </View>
              {!isLast ? (
                <View style={[baseLineStyle, lineStateStyle]} />
              ) : null}
            </View>
            <View className="flex-1 ml-4 pt-1">
              <Text className={titleClass}>{step.title}</Text>
              {step.description ? (
                <Text className={descriptionClass}>{step.description}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
