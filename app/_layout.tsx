import { DiscoveryEventsProvider } from '@/contexts/discovery-events-context';
import { EventsProvider } from '@/contexts/events-context';
import { LocationProvider } from '@/contexts/location-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import SplashScreenComponent from '../components/SplashScreenComponent';


export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [assetsReady, setAssetsReady] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function preloadImages() {
      try {
        const modules = [
          require('../assets/images/event1.png'),
          require('../assets/images/event2.png'),
          require('../assets/images/event3.png'),
          require('../assets/images/event4.png'),
          require('../assets/images/event5.png'),
          require('../assets/images/event-image.png'),
          require('../assets/images/ballot-logo-258118.png'),
        ];
        await Promise.all(modules.map((m) => Asset.fromModule(m).downloadAsync()));
      } catch (e) {
        // best-effort; continue even if asset caching fails
      } finally {
        setAssetsReady(true);
      }
    }
    preloadImages();
  }, []);

  useEffect(() => {
    if (loaded && assetsReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, assetsReady]);

  if (!loaded || !assetsReady) {
    return null;
  }

  if (showCustomSplash) {
    return <SplashScreenComponent onFinish={() => setShowCustomSplash(false)} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#FFFFFF',
      background: '#000000',
      card: '#151515',
      text: '#FFFFFF',
      border: 'rgba(255, 255, 255, 0.04)',
      notification: '#FFFFFF',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EventsProvider>
        <LocationProvider>
          <DiscoveryEventsProvider>
            <ThemeProvider value={customDarkTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
            </ThemeProvider>
          </DiscoveryEventsProvider>
        </LocationProvider>
      </EventsProvider>
    </GestureHandlerRootView>
  );
}
