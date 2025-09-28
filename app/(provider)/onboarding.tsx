import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Title from '@/components/ui/Title';
import { useProviderProfile } from '@/lib/provider/store';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProviderOnboarding() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

    const nameInputRef = useRef<TextInput>(null);
    const phoneInputRef = useRef<TextInput>(null);
    const { updateProfile } = useProviderProfile();

    // Auto-focus first input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            nameInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Validation functions
    const validateName = (value: string): string | undefined => {
        const trimmed = value.trim();
        if (!trimmed) return 'Full name is required';
        if (trimmed.length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
        return undefined;
    };

    const validatePhone = (value: string): string | undefined => {
        const trimmed = value.trim();
        if (!trimmed) return 'Phone number is required';
        // Remove all non-digit characters for validation
        const digitsOnly = trimmed.replace(/\D/g, '');
        if (digitsOnly.length < 8) return 'Phone number must be at least 8 digits';
        if (digitsOnly.length > 15) return 'Phone number must be less than 15 digits';
        if (!/^[\d\s\-\(\)\+]+$/.test(trimmed)) return 'Phone number contains invalid characters';
        return undefined;
    };

    const validateForm = (): boolean => {
        const nameError = validateName(name);
        const phoneError = validatePhone(phone);

        setErrors({
            name: nameError,
            phone: phoneError,
        });

        return !nameError && !phoneError;
    };

    const handleNameChange = (value: string) => {
        setName(value);
        // Clear error when user starts typing
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: undefined }));
        }
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        // Clear error when user starts typing
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: undefined }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Create profile and set online
            updateProfile({
                name: name.trim(),
                phone: phone.trim(),
                isOnline: true,
            });

            // Navigate to home screen
            router.replace('/(provider)/home');
        } catch (error) {
            console.error('Failed to save profile:', error);
            Alert.alert(
                'Error',
                'Failed to save your profile. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const isValid = name.trim().length > 0 && phone.trim().length > 0 && !errors.name && !errors.phone;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4 pt-8">
                <View className="mb-8">
                    <Title className="mb-2 text-center">Welcome, Provider!</Title>
                    <Text className="text-base text-center text-gray-600">
                        Let's get you set up to start receiving job invitations
                    </Text>
                </View>

                <Card className="mb-6">
                    <View className="space-y-6">
                        <View>
                            <Text className="mb-2 text-base font-medium text-gray-900">
                                Full Name *
                            </Text>
                            <TextInput
                                ref={nameInputRef}
                                value={name}
                                onChangeText={handleNameChange}
                                placeholder="Enter your full name"
                                className={`border rounded-xl px-4 py-3 text-base bg-white ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                autoCapitalize="words"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => phoneInputRef.current?.focus()}
                                testID="prov.onb.name"
                                accessibilityLabel="Full name"
                                accessibilityHint="Enter your full legal name"
                            />
                            {errors.name && (
                                <Text className="mt-1 text-sm text-red-500" testID="prov.onb.name.error">
                                    {errors.name}
                                </Text>
                            )}
                        </View>

                        <View>
                            <Text className="mb-2 text-base font-medium text-gray-900">
                                Phone Number *
                            </Text>
                            <TextInput
                                ref={phoneInputRef}
                                value={phone}
                                onChangeText={handlePhoneChange}
                                placeholder="Enter your phone number"
                                className={`border rounded-xl px-4 py-3 text-base bg-white ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                keyboardType="phone-pad"
                                autoCorrect={false}
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                                testID="prov.onb.phone"
                                accessibilityLabel="Phone number"
                                accessibilityHint="Enter your contact phone number"
                            />
                            {errors.phone && (
                                <Text className="mt-1 text-sm text-red-500" testID="prov.onb.phone.error">
                                    {errors.phone}
                                </Text>
                            )}
                        </View>
                    </View>
                </Card>

                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <View className="flex-row items-start space-x-3">
                        <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mt-0.5">
                            <Text className="text-xs font-bold text-white">i</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="mb-1 font-medium text-blue-900">
                                Cash Payment Only
                            </Text>
                            <Text className="text-sm text-blue-800">
                                All jobs are paid in cash on completion. You can handle one job at a time.
                            </Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>

            <View className="px-4 pb-4">
                <Button
                    onPress={handleSubmit}
                    disabled={!isValid || loading}
                    className={isValid ? 'bg-blue-600 shadow-lg' : 'bg-gray-100 border border-gray-300'}
                    testID="prov.onb.submit"
                >
                    {loading ? 'Setting up...' : 'Save & Go Online'}
                </Button>
            </View>
        </SafeAreaView>
    );
}
