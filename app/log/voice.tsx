import { View, Pressable, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  SlideInDown
} from 'react-native-reanimated';
import { T } from '@/components/ui/Text';
import { ConfirmSheet } from '@/components/scan/ConfirmSheet';
import { useVoiceRecognizer } from '@/lib/speech/recognizer';
import { useAnalyzeVoice, useSaveMeal } from '@/hooks/useAnalyzeFood';
import { colors, type } from '@/theme';
import * as haptics from '@/lib/utils/haptics';
import type { FoodAnalysis } from '@/lib/ai/foodAnalysis';

export default function VoiceScreen() {
  const { transcript, isRecording, start, stop } = useVoiceRecognizer();
  const analyze = useAnalyzeVoice();
  const save = useSaveMeal();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.cubic) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  const onPressIn = async () => {
    try {
      haptics.press();
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
      const r = await analyze.mutateAsync(text);
      if (!r.usable) throw new Error(r.warning ?? 'unusable');
      setResult(r);
    } catch (e) {
      haptics.error();
      console.warn(e);
    } finally {
      setBusy(false);
    }
  };

  const confirmSave = async (items: FoodAnalysis['items']) => {
    if (!result) return;
    await save.mutateAsync({
      consumedAt: new Date(),
      source: 'voice',
      rawInput: transcript,
      aiConfidence: result.confidence,
      items: items.map((i) => ({
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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-end' }}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <T variant="bodyMd" color={colors.inkMid}>
            Done
          </T>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
        <T variant="label" color={colors.inkLow} uppercase>
          Voice log · on-device
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
          Just say it.
        </T>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <T
          style={{
            fontFamily: 'InstrumentSerif-Italic',
            fontSize: transcript ? 32 : 22,
            lineHeight: transcript ? 40 : 30,
            color: transcript ? colors.inkHi : colors.inkLow,
            textAlign: 'center'
          }}
        >
          {transcript ||
            (isRecording
              ? 'Listening…'
              : 'A bowl of rice with grilled chicken and a tablespoon of soy sauce.')}
        </T>
      </View>

      <View style={{ alignItems: 'center', paddingBottom: 40 }}>
        <Animated.View style={pulseStyle}>
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={busy}
            style={{
              width: 152,
              height: 152,
              borderRadius: 999,
              backgroundColor: isRecording ? colors.danger : colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isRecording ? colors.danger : colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 24,
              elevation: 12
            }}
          >
            {busy ? (
              <ActivityIndicator color={colors.accentInk} />
            ) : (
              <T variant="h1" color={colors.accentInk}>
                ◉
              </T>
            )}
          </Pressable>
        </Animated.View>
        <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 16 }}>
          {busy ? 'Analyzing' : isRecording ? 'Recording' : 'Hold to speak'}
        </T>
      </View>

      <Modal
        visible={!!result}
        transparent
        animationType="none"
        onRequestClose={() => setResult(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <Animated.View entering={SlideInDown.duration(320)}>
            {result ? (
              <ConfirmSheet
                result={result}
                onConfirm={confirmSave}
                onCancel={() => setResult(null)}
              />
            ) : null}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
