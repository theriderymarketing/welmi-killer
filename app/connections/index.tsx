import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { PROVIDERS } from '@/lib/fitness/registry';
import type { FitnessProvider } from '@/lib/fitness/types';
import * as haptics from '@/lib/utils/haptics';

export default function ConnectionsScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ink-950 px-5">
      <Pressable onPress={() => router.back()} className="py-3">
        <Text className="text-ink-500">‹ Back</Text>
      </Pressable>

      <Text className="text-white text-3xl font-bold">Connections</Text>
      <Text className="text-ink-500 mt-1">
        Garmin & Apple Watch are captured automatically through Strava sync.
      </Text>

      <View className="mt-6 gap-2">
        {PROVIDERS.map((p) => (
          <ProviderRow key={p.id} provider={p} />
        ))}
      </View>
    </SafeAreaView>
  );
}

function ProviderRow({ provider }: { provider: FitnessProvider }) {
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    provider.isConnected().then(setConnected);
  }, [provider]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    haptics.tap();
    try {
      if (connected) {
        await provider.disconnect();
        setConnected(false);
      } else {
        await provider.connect();
        setConnected(await provider.isConnected());
      }
    } catch (e) {
      Alert.alert('Connection failed', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      onPress={toggle}
      className="bg-ink-800 border border-ink-700 rounded-2xl p-4 flex-row items-center justify-between"
    >
      <View className="flex-row items-center gap-3">
        <Text style={{ fontSize: 28 }}>{provider.icon}</Text>
        <View>
          <Text className="text-white font-semibold">{provider.name}</Text>
          <Text className="text-ink-500 text-xs mt-0.5">
            {connected ? 'Connected' : 'Tap to connect'}
          </Text>
        </View>
      </View>
      <Text className={connected ? 'text-accent-lime' : 'text-ink-500'}>
        {busy ? '…' : connected ? '✓' : '+'}
      </Text>
    </Pressable>
  );
}
