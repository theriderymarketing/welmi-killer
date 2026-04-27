import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatsScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ink-950">
      <View className="px-5 pt-4">
        <Text className="text-white text-3xl font-bold">Stats</Text>
        <Text className="text-ink-500 mt-2">Charts coming next iteration.</Text>
      </View>
    </SafeAreaView>
  );
}
