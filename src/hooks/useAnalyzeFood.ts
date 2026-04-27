import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeFoodPhoto, analyzeFoodVoice } from '@/lib/ai/foodAnalysis';
import { insertMealWithItems } from '@/db/repos/meals';
import { useUserId } from './useProfile';
import * as haptics from '@/lib/utils/haptics';

export function useAnalyzePhoto() {
  return useMutation({
    mutationFn: (uri: string) => analyzeFoodPhoto(uri),
    onSuccess: () => haptics.success(),
    onError: () => haptics.error()
  });
}

export function useAnalyzeVoice() {
  return useMutation({
    mutationFn: (transcript: string) => analyzeFoodVoice(transcript),
    onSuccess: () => haptics.success(),
    onError: () => haptics.error()
  });
}

export function useSaveMeal() {
  const qc = useQueryClient();
  const { data: userId } = useUserId();
  return useMutation({
    mutationFn: async (meal: {
      consumedAt: Date;
      source: 'photo' | 'voice' | 'manual';
      photoLocalPath?: string;
      rawInput?: string;
      aiConfidence?: number;
      items: Array<{
        name: string;
        quantityG: number;
        kcal: number;
        proteinG: number;
        carbsG: number;
        fatG: number;
        confidence?: number;
      }>;
    }) => {
      if (!userId) throw new Error('no_user_id');
      return insertMealWithItems({ ...meal, userId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today'] });
      haptics.success();
    }
  });
}
