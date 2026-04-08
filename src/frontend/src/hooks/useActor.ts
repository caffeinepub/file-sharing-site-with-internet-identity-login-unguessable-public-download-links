import { createActor } from "@/backend";
import { useActor as _useActor } from "@caffeineai/core-infrastructure";

/**
 * App-scoped useActor hook pre-bound to this project's backend actor.
 * All feature hooks should import from here, not from core-infrastructure directly.
 */
export function useActor() {
  return _useActor(createActor);
}
