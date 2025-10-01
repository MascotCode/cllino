import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function KeyboardScreen({ children }: { children: React.ReactNode }) {
    const inset = useSafeAreaInsets();
    return (
        <SafeAreaView className="flex-1 bg-surface-50">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.select({ ios: 'padding', android: 'height' })}
                keyboardVerticalOffset={Platform.select({ ios: inset.top + 8, android: 0 })}
            >
                {children}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

