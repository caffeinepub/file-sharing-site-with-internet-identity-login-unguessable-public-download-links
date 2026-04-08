import { useActor } from "@/hooks/useActor";
import type { FileInfoAdmin } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../react-query/queryKeys";

export function useAllFiles(enabled = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FileInfoAdmin[]>({
    queryKey: queryKeys.allFiles,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllFiles();
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: false,
  });
}
