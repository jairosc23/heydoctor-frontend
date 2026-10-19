/**
 * CP-26 — Realtime Synchronization Foundation types.
 * Transport-agnostic events that map onto MedicalCopilotStore actions.
 */

import type { MedicalCopilotDataSource } from "../store-types";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "../types";

export type RealtimeEventType =
  | "workspace_updated"
  | "timeline_updated"
  | "memory_updated"
  | "action_updated"
  | "session_updated"
  | "connection_state";

export type RealtimeConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export type RealtimeConnectionState = {
  status: RealtimeConnectionStatus;
  dataSource: MedicalCopilotDataSource;
  reason: string | null;
  updatedAt: string | null;
};

export type RealtimeEventBase = {
  /** Producer that originated the event (rest | sse | websocket). */
  source: MedicalCopilotDataSource;
  /** ISO-8601 timestamp when the event occurred. */
  occurredAt: string;
  /** Optional correlation / idempotency key. */
  eventId?: string;
};

export type WorkspaceUpdatedEvent = RealtimeEventBase & {
  type: "workspace_updated";
  payload: { workspace: MedicalCopilotWorkspaceSummary | null };
};

export type TimelineUpdatedEvent = RealtimeEventBase & {
  type: "timeline_updated";
  payload: { timeline: MedicalCopilotTimelineSummary | null };
};

export type MemoryUpdatedEvent = RealtimeEventBase & {
  type: "memory_updated";
  payload: {
    memory: MedicalCopilotMemorySummary | null;
    /**
     * Optional companion slice for full REST refresh sync.
     * When present, REFRESH_SUCCESS replaces `actions` atomically.
     */
    actions?: MedicalCopilotActionSummary[];
  };
};

export type ActionUpdatedEvent = RealtimeEventBase & {
  type: "action_updated";
  payload: { action: MedicalCopilotActionSummary };
};

export type SessionUpdatedEvent = RealtimeEventBase & {
  type: "session_updated";
  payload: { session: MedicalCopilotSessionSummary };
};

export type ConnectionStateEvent = RealtimeEventBase & {
  type: "connection_state";
  payload: {
    status: RealtimeConnectionStatus;
    dataSource?: MedicalCopilotDataSource;
    reason?: string | null;
  };
};

export type RealtimeEvent =
  | WorkspaceUpdatedEvent
  | TimelineUpdatedEvent
  | MemoryUpdatedEvent
  | ActionUpdatedEvent
  | SessionUpdatedEvent
  | ConnectionStateEvent;

export const INITIAL_REALTIME_CONNECTION_STATE: RealtimeConnectionState = {
  status: "disconnected",
  dataSource: "rest",
  reason: null,
  updatedAt: null,
};
