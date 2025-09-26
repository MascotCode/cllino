import { Pressable, Text, View } from 'react-native';

interface ToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    trueLabel?: string;
    falseLabel?: string;
    testID?: string;
    disabled?: boolean;
}

export default function Toggle({
    value,
    onValueChange,
    trueLabel = 'Online',
    falseLabel = 'Offline',
    testID,
    disabled = false
}: ToggleProps) {
    const handlePress = () => {
        if (!disabled) {
            onValueChange(!value);
        }
    };

    const activeStyle = value
        ? 'bg-green-500 border-green-500'
        : 'bg-gray-300 border-gray-300';

    const textStyle = value
        ? 'text-white'
        : 'text-gray-600';

    const disabledStyle = disabled ? 'opacity-50' : '';

    return (
        <Pressable
            onPress={handlePress}
            className={`rounded-full px-6 py-3 border-2 ${activeStyle} ${disabledStyle} active:opacity-80`}
            testID={testID}
            disabled={disabled}
        >
            <View className="items-center">
                <Text className={`text-base font-semibold ${textStyle}`}>
                    {value ? trueLabel : falseLabel}
                </Text>
            </View>
        </Pressable>
    );
}


