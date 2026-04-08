import { useActor } from "@/hooks/useActor";
import type { FileId } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../react-query/queryKeys";

export function useDeleteFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: FileId) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.deleteFile(fileId);
      return fileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myFiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.allFiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.globalStats });
      toast.success("File deleted successfully");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete file";
      toast.error(message);
    },
  });
}
