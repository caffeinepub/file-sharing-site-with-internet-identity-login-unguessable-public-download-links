import { useActor } from "@/hooks/useActor";
import type { FileInfo } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../react-query/queryKeys";

export function useMyFiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FileInfo[]>({
    queryKey: queryKeys.myFiles,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerFiles();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
