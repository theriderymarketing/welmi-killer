import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/db/repos/profile';
import { getOrCreateUserId } from '@/lib/utils/id';

export function useUserId() {
  return useQuery({
    queryKey: ['userId'],
    queryFn: getOrCreateUserId,
    staleTime: Infinity
  });
}

export function useProfile() {
  const { data: userId } = useUserId();
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    staleTime: 60_000
  });
}
