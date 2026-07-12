/**
 * CP-29 — VoicePipelineDispatcher (fan-out to observers).
 */

import type {
  VoicePipelineDispatcher,
  VoicePipelineObserver,
} from "./contracts";
import type { VoicePipelineEvent } from "./types";

export function createVoicePipelineDispatcher(): VoicePipelineDispatcher {
  const observers = new Map<string, VoicePipelineObserver>();

  return {
    subscribe(observer) {
      observers.set(observer.id, observer);
      return () => {
        observers.delete(observer.id);
      };
    },

    unsubscribe(observerId) {
      observers.delete(observerId);
    },

    dispatch(event: VoicePipelineEvent): number {
      let delivered = 0;
      for (const observer of observers.values()) {
        if (
          observer.types &&
          observer.types.length > 0 &&
          !observer.types.includes(event.type)
        ) {
          continue;
        }
        observer.onEvent(event);
        delivered += 1;
      }
      return delivered;
    },

    observerCount() {
      return observers.size;
    },

    listObserverIds() {
      return Array.from(observers.keys());
    },
  };
}
