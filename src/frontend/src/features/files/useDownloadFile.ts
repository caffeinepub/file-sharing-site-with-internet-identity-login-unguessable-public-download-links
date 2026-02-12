import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { triggerDownload } from '@/utils/download';
import { queryKeys } from '../react-query/queryKeys';

export function useDownloadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not initialized');

      const result = await actor.downloadFile(token);
      return result;
    },
    onSuccess: (data) => {
      triggerDownload(data.byteData, data.originalFilename);
      // Invalidate global stats to reflect the new download count
      queryClient.invalidateQueries({ queryKey: queryKeys.globalStats });
    },
  });
}
