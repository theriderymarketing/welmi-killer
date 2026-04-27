import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManualScreen() {
  return (
    <SafeAreaView className="flex-1 bg-ink-950 px-5 pt-4">
      <Text className="text-white text-2xl font-bold">Manual entry</Text>
      <Text className="text-ink-500 mt-2">Free-form macro form coming next iteration.</Text>
    </SafeAreaView>
  );
}
