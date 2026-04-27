import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useAnalyzePhoto, useSaveMeal } from '@/hooks/useAnalyzeFood';
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
      <View className="flex-1 bg-ink-950 items-center justify-center px-6">
        <Text className="text-white text-center mb-4">Camera permission required to scan meals.</Text>
        <Pressable onPress={requestPerm} className="bg-accent-lime px-6 py-3 rounded-full">
          <Text className="text-ink-950 font-semibold">Grant access</Text>
        </Pressable>
      </View>
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
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <View className="absolute inset-x-0 bottom-12 items-center">
        {busy ? (
          <View className="bg-black/60 rounded-2xl px-5 py-3">
            <ActivityIndicator color="#a3e635" />
            <Text className="text-white text-xs mt-2">Analyzing…</Text>
          </View>
        ) : (
          <Pressable
            onPress={capture}
            className="w-20 h-20 rounded-full bg-white border-4 border-accent-lime"
          />
        )}
      </View>
      <Pressable
        onPress={() => router.back()}
        className="absolute top-12 left-5 bg-black/50 px-4 py-2 rounded-full"
      >
        <Text className="text-white">Cancel</Text>
      </Pressable>
    </View>
  );
}
