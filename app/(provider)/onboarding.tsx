import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeBanner from '@/components/ui/NoticeBanner';
import StickyFooter from '@/components/ui/StickyFooter';
import { useProviderProfile } from '@/lib/provider/store';
import { tid } from '@/lib/testing/testIDs';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProviderOnboarding() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const inset = useSafeAreaInsets();

  const nameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const { updateProfile } = useProviderProfile();

  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, []);

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
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 8) return 'Phone number must be at least 8 digits';
    if (digitsOnly.length > 15) return 'Phone number must be less than 15 digits';
    if (!/^[\d\s\-\(\)\+]+$/.test(trimmed)) return 'Phone number contains invalid characters';
    return undefined;
  };

  const validateForm = (): boolean => {
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);

    setErrors({ name: nameError, phone: phoneError });

    return !nameError && !phoneError;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        isOnline: true
      });

      router.replace('/(provider)/home');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim().length > 0 && phone.trim().length > 0 && !errors.name && !errors.phone;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-component pt-section pb-section gap-section">
            <View className="gap-tight">
              <Text className="text-[28px] leading-[34px] font-extrabold text-gray-900">
                Welcome, Provider!
              </Text>
              <Text className="text-[16px] leading-[24px] text-gray-700">
                Set up your profile so customers can start requesting your service.
              </Text>
            </View>

            <Card className="gap-component">
              <View className="gap-tight">
                <Text className="text-[16px] leading-[24px] font-medium text-gray-900">
                  Full name *
                </Text>
                <TextInput
                  ref={nameInputRef}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Enter your full name"
                  className={`rounded-xl border px-component py-component text-[16px] leading-[24px] bg-white ${errors.name ? 'border-rose-500' : 'border-gray-300 focus:border-blue-500'}`}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  testID={tid.provider.onboarding.name}
                  accessibilityLabel="Full name"
                  accessibilityHint="Enter your full legal name"
                />
                {errors.name && (
                  <Text className="text-[14px] leading-[20px] text-rose-600" testID={tid.provider.onboarding.nameError}>
                    {errors.name}
                  </Text>
                )}
              </View>

              <View className="gap-tight">
                <Text className="text-[16px] leading-[24px] font-medium text-gray-900">
                  Phone number *
                </Text>
                <TextInput
                  ref={phoneInputRef}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter your phone number"
                  className={`rounded-xl border px-component py-component text-[16px] leading-[24px] bg-white ${errors.phone ? 'border-rose-500' : 'border-gray-300 focus:border-blue-500'}`}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  testID={tid.provider.onboarding.phone}
                  accessibilityLabel="Phone number"
                  accessibilityHint="Enter your contact phone number"
                />
                {errors.phone && (
                  <Text className="text-[14px] leading-[20px] text-rose-600" testID={tid.provider.onboarding.phoneError}>
                    {errors.phone}
                  </Text>
                )}
              </View>
            </Card>

            <NoticeBanner
              tone="info"
              title="Cash payments only"
              body="All jobs are paid in cash on completion. You can handle one job at a time."
            />
          </View>
        </ScrollView>

        <StickyFooter>
          <Button
            onPress={handleSubmit}
            disabled={!isValid || loading}
            variant="primary"
            testID={tid.provider.onboarding.submit}
          >
            {loading ? 'Setting up…' : 'Save & Go Online'}
          </Button>
        </StickyFooter>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
