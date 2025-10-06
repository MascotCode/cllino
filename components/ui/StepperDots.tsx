import { View } from 'react-native';

type StepperDotsProps = {
  step: 0 | 1 | 2 | 3;
};

export default function StepperDots({ step }: StepperDotsProps) {
  return (
    <View className="flex-row items-center space-x-2">
      {[0, 1, 2, 3].map((index) => (
        <View key={index} className={`h-2 w-2 rounded-full ${index <= step ? 'bg-blue-600' : 'bg-gray-300'}`} />
      ))}
    </View>
  );
}
