import { useQuery } from '@tanstack/react-query';
import { getMealsForDay, getDailyTotals } from '@/db/repos/meals';
import { useUserId } from './useProfile';

export function useToday() {
  const { data: userId } = useUserId();
  return useQuery({
    queryKey: ['today', userId],
    enabled: !!userId,
    queryFn: async () => {
      const day = new Date();
      const [meals, totals] = await Promise.all([
        getMealsForDay(userId!, day),
        getDailyTotals(userId!, day)
      ]);
      return { meals, totals };
    },
    staleTime: 10_000
  });
}
