import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '../react-query/queryKeys';
import type { FileMetadata } from '@/backend';

export function useMyFiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FileMetadata[]>({
    queryKey: queryKeys.myFiles,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerFiles();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
