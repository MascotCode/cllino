// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-navigation/native',
              message:
                'Use expo-router `router` instead of React Navigation hooks in app code.',
            },
            {
              name: '@react-navigation/bottom-tabs',
              message:
                'Use expo-router `router` instead of React Navigation hooks in app code.',
            },
            {
              name: '@react-navigation/native-stack',
              message:
                'Use expo-router `router` instead of React Navigation hooks in app code.',
            },
          ],
        },
      ],
    },
  },
]);
