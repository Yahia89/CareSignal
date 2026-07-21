import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { Providers } from './src/app/Providers';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';
import { OfflineBanner } from './src/shared/components';
import { InAppNotificationToast } from './src/shared/components/InAppNotificationToast';
import { View } from 'react-native';

// Keep the native splash visible until our JS is ready (fonts loaded).
// Errors here are non-fatal — if hideAsync was already called the promise rejects.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Block render until fonts are loaded so we don't flash system font first.
  // If the font load actually errors out, fall through and render anyway with
  // system fallback rather than leaving the user on a blank splash forever.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Providers>
        <View style={{ flex: 1 }}>
          <OfflineBanner />
          <View style={{ flex: 1 }}>
            <RootNavigator />
          </View>
        </View>
        <StatusBar style="auto" />
        <InAppNotificationToast />
      </Providers>
    </ErrorBoundary>
  );
}
