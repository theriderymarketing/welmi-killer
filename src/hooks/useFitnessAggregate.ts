import { useQuery } from '@tanstack/react-query';
import { fetchAllConnected, mergeDailyEnergy } from '@/lib/fitness/aggregator';
import { PROVIDERS } from '@/lib/fitness/registry';

export function useFitnessAggregate() {
  return useQuery({
    queryKey: ['fitnessAggregate'],
    queryFn: async () => {
      const days = await fetchAllConnected(PROVIDERS);
      return mergeDailyEnergy(days);
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true
  });
}
