import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MacroTracker } from '@/components/dashboard/MacroTracker';
import { useToday } from '@/hooks/useToday';

export default function TodayScreen() {
  const { data: today } = useToday();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ink-950">
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-ink-500 text-sm">{new Date().toDateString()}</Text>
          <Text className="text-white text-3xl font-bold mt-1">Today</Text>
        </View>

        <MacroTracker />

        <View className="px-5 mt-10 mb-8">
          <Text className="text-white text-lg font-semibold mb-3">Meals</Text>
          {today && today.meals.length === 0 ? (
            <Text className="text-ink-500">Nothing logged yet — tap an action above.</Text>
          ) : (
            today?.meals.map((m) => (
              <View key={m.id} className="bg-ink-800 rounded-2xl p-4 mb-2 flex-row justify-between">
                <View>
                  <Text className="text-white font-medium capitalize">{m.source} meal</Text>
                  <Text className="text-ink-500 text-xs mt-0.5">
                    {new Date(m.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text className="text-white font-semibold tabular-nums">
                  {Math.round(m.totalKcal)} kcal
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
