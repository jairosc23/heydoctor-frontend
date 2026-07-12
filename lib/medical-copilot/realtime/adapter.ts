/**
 * CP-26 — MedicalCopilotRealtimeAdapter.
 * External events → normalize → Store actions. No UI knowledge.
 */

import type {
  MedicalCopilotDataSource,
  MedicalCopilotRefreshPayload,
  MedicalCopilotStoreAction,
} from "../store-types";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "../types";
import type {
  MedicalCopilotRealtimeAdapter,
  MedicalCopilotStoreDispatch,
  MedicalCopilotStoreGetState,
  MedicalCopilotTransportAdapter,
  RealtimeEventDispatcher,
} from "./contracts";
import { createRealtimeEventDispatcher } from "./dispatcher";
import { createDefaultTransportAdapters } from "./transport-adapters";
import {
  INITIAL_REALTIME_CONNECTION_STATE,
  type RealtimeConnectionState,
  type RealtimeEvent,
} from "./types";

export type CreateMedicalCopilotRealtimeAdapterOptions = {
  dispatcher?: RealtimeEventDispatcher;
  transports?: Record<MedicalCopilotDataSource, MedicalCopilotTransportAdapter>;
};

function createEventId(): string {
  return `rt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createMedicalCopilotRealtimeAdapter(
  options: CreateMedicalCopilotRealtimeAdapterOptions = {},
): MedicalCopilotRealtimeAdapter {
  const dispatcher = options.dispatcher ?? createRealtimeEventDispatcher();
  const transports = options.transports ?? createDefaultTransportAdapters();

  let connectionState: RealtimeConnectionState = {
    ...INITIAL_REALTIME_CONNECTION_STATE,
  };
  let attached = false;

  function applyConnectionFromEvent(event: RealtimeEvent): void {
    if (event.type !== "connection_state") return;
    connectionState = {
      status: event.payload.status,
      dataSource: event.payload.dataSource ?? event.source,
      reason: event.payload.reason ?? null,
      updatedAt: event.occurredAt,
    };
  }

  const adapter: MedicalCopilotRealtimeAdapter = {
    get connectionState() {
      return connectionState;
    },

    attach(
      dispatch: MedicalCopilotStoreDispatch,
      getState: MedicalCopilotStoreGetState,
    ) {
      dispatcher.attach(dispatch, getState);
      attached = true;
      transports.rest.start();
      // SSE / WebSocket remain inactive stubs — do not start push sockets.
    },

    detach() {
      dispatcher.detach();
      attached = false;
      for (const transport of Object.values(transports)) {
        transport.stop();
      }
      connectionState = {
        ...INITIAL_REALTIME_CONNECTION_STATE,
        dataSource: connectionState.dataSource,
      };
    },

    ingest(event: RealtimeEvent) {
      if (!attached) {
        return [];
      }
      applyConnectionFromEvent(event);
      return dispatcher.dispatchEvent(event);
    },

    ingestMany(events: RealtimeEvent[]) {
      const dispatched: MedicalCopilotStoreAction[] = [];
      for (const event of events) {
        dispatched.push(...adapter.ingest(event));
      }
      return dispatched;
    },

    ingestRestRefresh(payload: MedicalCopilotRefreshPayload) {
      return adapter.ingestMany([
        createRestConnectionStateEvent(
          "connected",
          "rest_refresh",
          payload.syncedAt,
        ),
        ...restRefreshToRealtimeEvents(payload),
      ]);
    },

    setDataSource(dataSource: MedicalCopilotDataSource) {
      adapter.ingest({
        type: "connection_state",
        source: dataSource,
        occurredAt: new Date().toISOString(),
        eventId: createEventId(),
        payload: {
          status: connectionState.status,
          dataSource,
          reason: "data_source_switched",
        },
      });
    },

    getTransport(kind: MedicalCopilotDataSource) {
      return transports[kind];
    },
  };

  return adapter;
}

/** Helpers to build normalized events from REST snapshots (no socket). */
export function createRestWorkspaceUpdatedEvent(
  workspace: MedicalCopilotWorkspaceSummary | null,
  occurredAt = new Date().toISOString(),
): RealtimeEvent {
  return {
    type: "workspace_updated",
    source: "rest",
    occurredAt,
    eventId: createEventId(),
    payload: { workspace },
  };
}

export function createRestTimelineUpdatedEvent(
  timeline: MedicalCopilotTimelineSummary | null,
  occurredAt = new Date().toISOString(),
): RealtimeEvent {
  return {
    type: "timeline_updated",
    source: "rest",
    occurredAt,
    eventId: createEventId(),
    payload: { timeline },
  };
}

export function createRestMemoryUpdatedEvent(
  memory: MedicalCopilotMemorySummary | null,
  occurredAt = new Date().toISOString(),
  actions?: MedicalCopilotActionSummary[],
): RealtimeEvent {
  return {
    type: "memory_updated",
    source: "rest",
    occurredAt,
    eventId: createEventId(),
    payload: {
      memory,
      ...(actions !== undefined ? { actions } : {}),
    },
  };
}

export function createRestActionUpdatedEvent(
  action: MedicalCopilotActionSummary,
  occurredAt = new Date().toISOString(),
): RealtimeEvent {
  return {
    type: "action_updated",
    source: "rest",
    occurredAt,
    eventId: createEventId(),
    payload: { action },
  };
}

export function createRestSessionUpdatedEvent(
  session: MedicalCopilotSessionSummary,
  occurredAt = new Date().toISOString(),
): RealtimeEvent {
  return {
    type: "session_updated",
    source: "rest",
    occurredAt,
    eventId: createEventId(),
    payload: { session },
  };
}

export function createRestConnectionStateEvent(
  status: RealtimeConnectionState["status"],
  reason: string | null = null,
  occurredAt = new Date().toISOString(),
): RealtimeEvent {
  return {
    type: "connection_state",
    source: "rest",
    occurredAt,
    eventId: createEventId(),
    payload: {
      status,
      dataSource: "rest",
      reason,
    },
  };
}

/**
 * Expand a REST refresh payload into ordered realtime events.
 * memory_updated carries `actions` for atomic list replace via REFRESH_SUCCESS.
 * Future SSE/WS payloads should emit the same RealtimeEvent shapes.
 */
export function restRefreshToRealtimeEvents(
  payload: MedicalCopilotRefreshPayload,
): RealtimeEvent[] {
  const occurredAt = payload.syncedAt;
  return [
    createRestWorkspaceUpdatedEvent(payload.workspace, occurredAt),
    createRestTimelineUpdatedEvent(payload.timeline, occurredAt),
    createRestMemoryUpdatedEvent(
      payload.memory,
      occurredAt,
      payload.actions,
    ),
  ];
}
