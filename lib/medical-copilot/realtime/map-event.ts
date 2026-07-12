/**
 * CP-26 — Maps RealtimeEvent → existing MedicalCopilotStoreAction[].
 * Does not extend the Store; merges with getState() for partial updates.
 */

import type {
  MedicalCopilotRefreshPayload,
  MedicalCopilotStoreAction,
} from "../store-types";
import type {
  MedicalCopilotStoreGetState,
  RealtimeEventMapper,
} from "./contracts";
import type { RealtimeEvent } from "./types";

function nowIso(fallback?: string): string {
  return fallback ?? new Date().toISOString();
}

function refreshFromState(
  getState: MedicalCopilotStoreGetState,
  patch: Partial<MedicalCopilotRefreshPayload>,
  syncedAt: string,
): MedicalCopilotStoreAction {
  const state = getState();
  return {
    type: "REFRESH_SUCCESS",
    payload: {
      workspace:
        patch.workspace !== undefined ? patch.workspace : state.workspace,
      timeline: patch.timeline !== undefined ? patch.timeline : state.timeline,
      memory: patch.memory !== undefined ? patch.memory : state.memory,
      actions: patch.actions !== undefined ? patch.actions : state.actions,
      syncedAt,
    },
  };
}

/**
 * Pure mapper — same Store actions for REST, SSE, WebSocket, or Voice producers.
 */
export const defaultRealtimeEventMapper: RealtimeEventMapper = {
  map(event: RealtimeEvent, getState: MedicalCopilotStoreGetState) {
    const syncedAt = nowIso(event.occurredAt);

    switch (event.type) {
      case "workspace_updated":
        return [
          refreshFromState(
            getState,
            { workspace: event.payload.workspace },
            syncedAt,
          ),
        ];

      case "timeline_updated":
        return [
          refreshFromState(
            getState,
            { timeline: event.payload.timeline },
            syncedAt,
          ),
        ];

      case "memory_updated":
        return [
          refreshFromState(
            getState,
            {
              memory: event.payload.memory,
              ...(event.payload.actions !== undefined
                ? { actions: event.payload.actions }
                : {}),
            },
            syncedAt,
          ),
        ];

      case "action_updated":
        return [
          {
            type: "ACTION_UPDATED",
            payload: { action: event.payload.action },
          },
        ];

      case "session_updated": {
        const state = getState();
        return [
          {
            type: "BOOTSTRAP_SUCCESS",
            payload: {
              session: event.payload.session,
              workspace: state.workspace,
              timeline: state.timeline,
              memory: state.memory,
              actions: state.actions,
              syncedAt,
            },
          },
        ];
      }

      case "connection_state": {
        const nextSource = event.payload.dataSource ?? event.source;
        const state = getState();
        if (state.dataSource === nextSource) {
          return [];
        }
        return [
          {
            type: "SET_DATA_SOURCE",
            payload: { dataSource: nextSource },
          },
        ];
      }

      default: {
        const _exhaustive: never = event;
        void _exhaustive;
        return [];
      }
    }
  },
};

export function mapRealtimeEventToStoreActions(
  event: RealtimeEvent,
  getState: MedicalCopilotStoreGetState,
  mapper: RealtimeEventMapper = defaultRealtimeEventMapper,
): MedicalCopilotStoreAction[] {
  return mapper.map(event, getState);
}
