import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { useVoiceRecognizer } from '@/lib/speech/recognizer';
import { useAnalyzeVoice, useSaveMeal } from '@/hooks/useAnalyzeFood';
import * as haptics from '@/lib/utils/haptics';

export default function VoiceScreen() {
  const { transcript, isRecording, start, stop } = useVoiceRecognizer();
  const analyze = useAnalyzeVoice();
  const save = useSaveMeal();
  const [busy, setBusy] = useState(false);

  const onPressIn = async () => {
    try {
      await start();
    } catch (e) {
      haptics.error();
      console.warn(e);
    }
  };

  const onPressOut = async () => {
    const text = stop();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const result = await analyze.mutateAsync(text);
      if (!result.usable) throw new Error(result.warning ?? 'unusable');
      await save.mutateAsync({
        consumedAt: new Date(),
        source: 'voice',
        rawInput: text,
        aiConfidence: result.confidence,
        items: result.items.map((i) => ({
          name: i.name,
          quantityG: i.quantity_g,
          kcal: i.kcal,
          proteinG: i.protein_g,
          carbsG: i.carbs_g,
          fatG: i.fat_g,
          confidence: i.confidence
        }))
      });
      router.back();
    } catch (e) {
      haptics.error();
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-950 items-center justify-center px-6">
      <Text className="text-ink-500 text-sm uppercase tracking-widest">Hold to describe your meal</Text>
      <Text className="text-white text-center text-xl mt-6 min-h-12">
        {transcript || (isRecording ? 'Listening…' : 'Press and hold')}
      </Text>

      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={busy}
        className={`w-44 h-44 rounded-full mt-12 items-center justify-center ${
          isRecording ? 'bg-accent-rose' : 'bg-white'
        }`}
      >
        {busy ? <ActivityIndicator color="#000" /> : <Text style={{ fontSize: 40 }}>🎤</Text>}
      </Pressable>

      <Pressable onPress={() => router.back()} className="mt-12">
        <Text className="text-ink-500">Cancel</Text>
      </Pressable>
    </SafeAreaView>
  );
}
