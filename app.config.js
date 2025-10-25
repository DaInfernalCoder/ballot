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
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    // Environment variables exposed to the app via expo-constants
    extra: {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    },
  },
};
