import { View, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { PROVIDERS } from '@/lib/fitness/registry';
import type { FitnessProvider } from '@/lib/fitness/types';
import { colors, radius, type } from '@/theme';
import * as haptics from '@/lib/utils/haptics';

export default function ConnectionsScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingHorizontal: 24 }}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={{ paddingVertical: 12 }}>
          <T variant="bodyMd" color={colors.inkMid}>
            ‹ Back
          </T>
        </Pressable>

        <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 12 }}>
          Connections
        </T>
        <T
          style={{
            fontFamily: type.display.family,
            fontSize: 56,
            lineHeight: 60,
            letterSpacing: -2,
            color: colors.inkHi,
            marginTop: 4
          }}
        >
          Your gear.
        </T>
        <T variant="body" color={colors.inkMid} style={{ marginTop: 14, maxWidth: 320 }}>
          Garmin and Apple Watch are captured automatically through Strava sync — no extra setup needed.
        </T>

        <View style={{ marginTop: 28, gap: 8 }}>
          {PROVIDERS.map((p) => (
            <ProviderRow key={p.id} provider={p} />
          ))}
        </View>
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
    <PressScale
      haptic="tap"
      onPress={toggle}
      style={{
        backgroundColor: colors.surface,
        borderColor: connected ? colors.accent : colors.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: colors.elevated,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <T style={{ fontSize: 24 }}>{provider.icon}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="h3" color={colors.inkHi}>
            {provider.name}
          </T>
          <T variant="bodySm" color={colors.inkMid} style={{ marginTop: 2 }}>
            {connected ? 'Connected — syncing every 5 min' : 'Tap to connect via OAuth'}
          </T>
        </View>
      </View>
      <T variant="label" color={connected ? colors.accent : colors.inkLow} uppercase>
        {busy ? '…' : connected ? '✓ ON' : '+ ADD'}
      </T>
    </PressScale>
  );
}
