import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

interface AddressRowProps {
    icon: IconName;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    testID?: string;
    showChevron?: boolean;
}

/**
 * Generic row component for address selection with icon, title, optional subtitle,
 * and optional chevron. Minimum 48dp height for touch accessibility.
 */
export default function AddressRow({
    icon,
    iconColor = '#6B7280',
    title,
    subtitle,
    onPress,
    testID,
    showChevron = true,
}: AddressRowProps) {
    return (
        <Pressable
            testID={testID}
            onPress={onPress}
            className="flex-row items-center py-4 px-1 active:opacity-60 active:bg-gray-50"
            accessibilityRole="button"
            accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
            style={{ minHeight: 48 }}
        >
            {/* Leading icon */}
            <View className="mr-3">
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>

            {/* Content */}
            <View className="flex-1">
                <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
                        {subtitle}
                    </Text>
                )}
            </View>

            {/* Trailing chevron */}
            {showChevron && (
                <View className="ml-2">
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </View>
            )}
        </Pressable>
    );
}

