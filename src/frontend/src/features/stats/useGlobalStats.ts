import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../react-query/queryKeys";

export function useGlobalStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: queryKeys.globalStats,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPlatformCounts();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
  });
}
