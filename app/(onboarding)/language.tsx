import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇲🇦', enabled: false },
];

export default function LanguageScreen() {
  const handleLanguageSelection = async (languageCode: string) => {
    try {
      await AsyncStorage.setItem('language', languageCode);
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Navigate to the main app
      router.replace('/(public)');
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="pt-12 pb-8 px-6">
        <View className="flex-row items-center justify-between">
          <Pressable
            testID="btn-back"
            onPress={goBack}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </Pressable>
          <View className="flex-1" />
        </View>
        
        <View className="mt-8">
          <Text className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Language
          </Text>
          <Text className="text-lg text-gray-600 leading-6">
            Select your preferred language for the app interface
          </Text>
        </View>
      </View>

      {/* Language Options */}
      <View className="flex-1 px-6">
        <View className="gap-3">
          {LANGUAGES.map((language) => (
            <Pressable
              key={language.code}
              testID={`btn-language-${language.code}`}
              className={`rounded-2xl p-6 border-2 ${
                language.enabled
                  ? 'bg-white border-gray-200 active:opacity-90'
                  : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
              onPress={() => language.enabled && handleLanguageSelection(language.code)}
              disabled={!language.enabled}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <Text className="text-3xl">{language.flag}</Text>
                  <View>
                    <Text className={`text-xl font-semibold ${
                      language.enabled ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {language.name}
                    </Text>
                    <Text className={`text-base ${
                      language.enabled ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {language.nativeName}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center gap-2">
                  {!language.enabled && (
                    <View className="bg-orange-100 px-3 py-1 rounded-full">
                      <Text className="text-sm font-medium text-orange-700">
                        Coming Soon
                      </Text>
                    </View>
                  )}
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={language.enabled ? "#9ca3af" : "#d1d5db"} 
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        
        <View className="mt-8">
          <Text className="text-sm text-gray-500 text-center leading-5">
            You can change your language preference later in the app settings
          </Text>
        </View>
      </View>
    </View>
  );
}
