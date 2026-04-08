import { useActor } from "@/hooks/useActor";
import type { FileId } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../react-query/queryKeys";

export function useRenameFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fileId,
      newName,
    }: {
      fileId: FileId;
      newName: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.renameFile(fileId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myFiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.allFiles });
      toast.success("File renamed successfully");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to rename file";
      toast.error(message);
    },
  });
}
