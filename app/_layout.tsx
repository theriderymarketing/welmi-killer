import '../global.css';
import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { initDatabase } from '@/db/client';
import { getProfile } from '@/db/repos/profile';
import { getOrCreateUserId } from '@/lib/utils/id';

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDatabase();
      const userId = await getOrCreateUserId();
      const profile = await getProfile(userId);
      setReady(true);
      if (!profile) router.replace('/(onboarding)');
    })();
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#09090b' }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090b' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="log/camera" options={{ presentation: 'modal' }} />
          <Stack.Screen name="log/voice" options={{ presentation: 'modal' }} />
          <Stack.Screen name="log/manual" options={{ presentation: 'modal' }} />
          <Stack.Screen name="connections/index" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
