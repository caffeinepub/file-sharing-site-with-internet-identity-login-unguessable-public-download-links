import { useActor } from "@/hooks/useActor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../react-query/queryKeys";

export function useDownloadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      filename,
    }: { token: string; filename: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      const blob = await actor.downloadFile(token);
      return { blob, filename };
    },
    onSuccess: async ({ blob, filename }) => {
      const bytes = await blob.getBytes();
      const url = URL.createObjectURL(new Blob([bytes]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // Invalidate global stats to reflect the new download count
      queryClient.invalidateQueries({ queryKey: queryKeys.globalStats });
    },
  });
}
