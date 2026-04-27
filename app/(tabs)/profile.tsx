import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileScreen() {
  const { data: profile } = useProfile();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ink-950">
      <ScrollView className="px-5 pt-4">
        <Text className="text-white text-3xl font-bold">Profile</Text>

        <View className="bg-ink-800 rounded-2xl p-4 mt-6 gap-3">
          <Row k="BMR" v={`${profile?.bmrKcal ?? '—'} kcal`} />
          <Row k="TDEE" v={`${profile?.tdeeKcal ?? '—'} kcal`} />
          <Row k="Target" v={`${profile?.targetKcal ?? '—'} kcal`} />
          <Row k="Weight" v={`${profile?.weightKg ?? '—'} kg`} />
          <Row k="Goal" v={profile?.goal ?? '—'} />
        </View>

        <Pressable
          onPress={() => router.push('/connections')}
          className="bg-ink-800 border border-ink-700 rounded-2xl p-4 mt-4 flex-row justify-between items-center"
        >
          <View>
            <Text className="text-white font-semibold">Connections</Text>
            <Text className="text-ink-500 text-xs mt-1">Strava, COROS, Oura, Whoop</Text>
          </View>
          <Text className="text-ink-500">›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-ink-500">{k}</Text>
      <Text className="text-white font-medium capitalize">{v}</Text>
    </View>
  );
}
