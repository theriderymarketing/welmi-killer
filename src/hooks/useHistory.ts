import { useQuery } from '@tanstack/react-query';
import { getDailyHistory } from '@/db/repos/history';
import { useUserId } from './useProfile';

export function useDailyHistory(days = 7) {
  const { data: userId } = useUserId();
  return useQuery({
    queryKey: ['history', userId, days],
    enabled: !!userId,
    queryFn: () => getDailyHistory(userId!, days),
    staleTime: 30_000
  });
}
