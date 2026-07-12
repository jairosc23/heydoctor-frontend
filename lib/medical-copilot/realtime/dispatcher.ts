/**
 * CP-26 — RealtimeEventDispatcher.
 * Receives normalized events and dispatches identical Store actions.
 */

import type {
  MedicalCopilotStoreDispatch,
  MedicalCopilotStoreGetState,
  RealtimeEventDispatcher,
  RealtimeEventMapper,
} from "./contracts";
import { defaultRealtimeEventMapper } from "./map-event";
import type { RealtimeEvent } from "./types";
import type { MedicalCopilotStoreAction } from "../store-types";

export type CreateRealtimeEventDispatcherOptions = {
  mapper?: RealtimeEventMapper;
};

export function createRealtimeEventDispatcher(
  options: CreateRealtimeEventDispatcherOptions = {},
): RealtimeEventDispatcher {
  const mapper = options.mapper ?? defaultRealtimeEventMapper;
  let dispatch: MedicalCopilotStoreDispatch | null = null;
  let getState: MedicalCopilotStoreGetState | null = null;

  return {
    attach(nextDispatch, nextGetState) {
      dispatch = nextDispatch;
      getState = nextGetState;
    },

    detach() {
      dispatch = null;
      getState = null;
    },

    dispatchEvent(event: RealtimeEvent): MedicalCopilotStoreAction[] {
      if (!dispatch || !getState) {
        return [];
      }
      const actions = mapper.map(event, getState);
      for (const action of actions) {
        dispatch(action);
      }
      return actions;
    },
  };
}
