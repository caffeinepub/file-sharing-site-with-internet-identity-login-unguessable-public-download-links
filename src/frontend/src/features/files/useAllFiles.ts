import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '../react-query/queryKeys';
import type { FileMetadata } from '@/backend';

export function useAllFiles(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FileMetadata[]>({
    queryKey: queryKeys.allFiles,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllFiles();
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: false,
  });
}
