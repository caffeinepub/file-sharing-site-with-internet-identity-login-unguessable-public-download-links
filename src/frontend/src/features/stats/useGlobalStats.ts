import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '../react-query/queryKeys';

export function useGlobalStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: queryKeys.globalStats,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      // Call the backend's getPlatformCounts method
      const stats = await actor.getPlatformCounts();

      return {
        totalFiles: stats.fileCount,
        totalBytes: stats.fileSize,
        totalDownloads: stats.downloadCount,
      };
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
  });
}
