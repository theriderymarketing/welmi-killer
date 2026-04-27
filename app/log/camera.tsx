import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { T } from '@/components/ui/Text';
import { useAnalyzePhoto, useSaveMeal } from '@/hooks/useAnalyzeFood';
import { colors, radius } from '@/theme';
import * as haptics from '@/lib/utils/haptics';

export default function CameraScreen() {
  const [perm, requestPerm] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [busy, setBusy] = useState(false);

  const analyze = useAnalyzePhoto();
  const save = useSaveMeal();

  if (!perm) return null;
  if (!perm.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <T variant="h2" color={colors.inkHi} align="center">
            Camera permission needed
          </T>
          <T variant="body" color={colors.inkMid} align="center" style={{ marginTop: 12 }}>
            We don't store your photos. Each meal photo is sent to the AI and discarded.
          </T>
          <Pressable
            onPress={requestPerm}
            style={{
              marginTop: 32,
              backgroundColor: colors.accent,
              borderRadius: radius.lg,
              paddingHorizontal: 28,
              paddingVertical: 14
            }}
          >
            <T variant="bodyMd" color={colors.accentInk}>
              Grant access
            </T>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const capture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    haptics.press();
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, base64: false });
    if (!photo) {
      setBusy(false);
      return;
    }

    try {
      const result = await analyze.mutateAsync(photo.uri);
      if (!result.usable) throw new Error(result.warning ?? 'unusable');

      await save.mutateAsync({
        consumedAt: new Date(),
        source: 'photo',
        photoLocalPath: photo.uri,
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
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* Top: cancel + framing hint */}
      <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          >
            <T variant="bodyMd" color={colors.inkHi}>
              Cancel
            </T>
          </Pressable>
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          >
            <T variant="label" color={colors.inkMid} uppercase>
              Frame the plate
            </T>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom: shutter */}
      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View style={{ alignItems: 'center', paddingBottom: 24 }}>
          {busy ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                paddingHorizontal: 28,
                paddingVertical: 18,
                borderRadius: radius.lg,
                alignItems: 'center'
              }}
            >
              <ActivityIndicator color={colors.accent} />
              <T variant="bodyMd" color={colors.inkHi} style={{ marginTop: 10 }}>
                Reading the plate…
              </T>
              <T variant="bodySm" color={colors.inkMid} style={{ marginTop: 4 }}>
                Identifying items, estimating portions
              </T>
            </Animated.View>
          ) : (
            <Pressable
              onPress={capture}
              style={{
                width: 84,
                height: 84,
                borderRadius: 999,
                backgroundColor: colors.inkHi,
                borderWidth: 4,
                borderColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  backgroundColor: colors.accent
                }}
              />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
