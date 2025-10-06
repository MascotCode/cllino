import { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface ListSectionProps {
    title: string;
    children: ReactNode;
    testID?: string;
}

/**
 * Section wrapper for lists with uppercase title.
 * Provides consistent spacing between sections.
 */
export default function ListSection({ title, children, testID }: ListSectionProps) {
    return (
        <View testID={testID} className="mt-4">
            <Text className="px-1 pb-2 text-xs font-medium tracking-wide uppercase text-gray-500">
                {title}
            </Text>
            <View className="gap-0">{children}</View>
        </View>
    );
}

