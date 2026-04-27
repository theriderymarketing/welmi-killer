import '../global.css';
import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { initDatabase } from '@/db/client';
import { getProfile } from '@/db/repos/profile';
import { getOrCreateUserId } from '@/lib/utils/id';
import { useAppFonts } from '@/theme/fonts';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1
    }
  }
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage });
persistQueryClient({ queryClient, persister, maxAge: 1000 * 60 * 60 * 24 });

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDatabase();
      const userId = await getOrCreateUserId();
      const profile = await getProfile(userId);
      setDbReady(true);
      // Defer route to next tick — gives time for navigation tree to mount
      setTimeout(() => {
        if (!profile) router.replace('/(onboarding)');
      }, 0);
    })();
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
            animation: 'fade',
            animationDuration: 200
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen
            name="log/camera"
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="log/voice"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="log/manual"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="connections/index" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
