import { View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { T } from '@/components/ui/Text';
import { useVoiceRecognizer } from '@/lib/speech/recognizer';
import { useAnalyzeVoice, useSaveMeal } from '@/hooks/useAnalyzeFood';
import { colors, radius, type } from '@/theme';
import * as haptics from '@/lib/utils/haptics';

export default function VoiceScreen() {
  const { transcript, isRecording, start, stop } = useVoiceRecognizer();
  const analyze = useAnalyzeVoice();
  const save = useSaveMeal();
  const [busy, setBusy] = useState(false);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Top: cancel */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-end' }}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <T variant="bodyMd" color={colors.inkMid}>
            Done
          </T>
        </Pressable>
      </View>

      {/* Title */}
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

      {/* Transcript */}
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

      {/* Mic button */}
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
    </SafeAreaView>
  );
}
