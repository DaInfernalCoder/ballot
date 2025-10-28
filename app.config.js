// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

module.exports = {
  expo: {
    name: 'ballot',
    slug: 'ballot',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'ballot',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-logo-7876fd.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ballot.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Ballot uses your location to show you relevant local political events and civic activities in your area.',
        NSUserNotificationsUsageDescription:
          'Ballot sends you reminders about upcoming civic events you have saved.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      package: 'com.ballot.app',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'POST_NOTIFICATIONS',
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'server',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#7876FD',
          sounds: ['default'],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    // Environment variables exposed to the app via expo-constants
    extra: {
      eas: {
        projectId: '538edb14-e063-41b9-a325-e996bdd5c9f9',
      },
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
    },
  },
};
