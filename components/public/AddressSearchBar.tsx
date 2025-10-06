import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

interface AddressSearchBarProps extends Omit<TextInputProps, 'onChangeText'> {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
    placeholder?: string;
    testID?: string;
}

/**
 * Search bar for address input with leading search icon and trailing clear button.
 * Minimum 44dp touch target for accessibility.
 */
export default function AddressSearchBar({
    value,
    onChangeText,
    onClear,
    placeholder = 'Search address',
    testID = 'address.modal.search',
    ...rest
}: AddressSearchBarProps) {
    return (
        <View className="flex-row items-center px-3 border border-gray-200 bg-white rounded-xl">
            {/* Leading search icon */}
            <Ionicons name="search" size={18} color="#6B7280" />

            {/* Search input */}
            <TextInput
                testID={testID}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 px-3 py-3 text-base text-gray-900"
                accessibilityLabel="Search address"
                {...rest}
            />

            {/* Trailing clear button - only visible when there's text */}
            <Pressable
                testID="address.modal.clear"
                onPress={onClear}
                className="p-2 -mr-1 active:opacity-60"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
            >
                <Ionicons
                    name="close-circle"
                    size={18}
                    color={value ? '#9CA3AF' : 'transparent'}
                />
            </Pressable>
        </View>
    );
}

