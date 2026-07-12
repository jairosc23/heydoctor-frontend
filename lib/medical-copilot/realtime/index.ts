/**
 * CP-26 — Medical Copilot Realtime Synchronization Foundation (public barrel).
 */

export type {
  MedicalCopilotRealtimeAdapter,
  MedicalCopilotStoreDispatch,
  MedicalCopilotStoreGetState,
  MedicalCopilotTransportAdapter,
  RealtimeEventDispatcher,
  RealtimeEventMapper,
} from "./contracts";

export type {
  ActionUpdatedEvent,
  ConnectionStateEvent,
  MemoryUpdatedEvent,
  RealtimeConnectionState,
  RealtimeConnectionStatus,
  RealtimeEvent,
  RealtimeEventBase,
  RealtimeEventType,
  SessionUpdatedEvent,
  TimelineUpdatedEvent,
  WorkspaceUpdatedEvent,
} from "./types";

export { INITIAL_REALTIME_CONNECTION_STATE } from "./types";

export {
  createMedicalCopilotRealtimeAdapter,
  createRestActionUpdatedEvent,
  createRestConnectionStateEvent,
  createRestMemoryUpdatedEvent,
  createRestSessionUpdatedEvent,
  createRestTimelineUpdatedEvent,
  createRestWorkspaceUpdatedEvent,
  restRefreshToRealtimeEvents,
} from "./adapter";

export { createRealtimeEventDispatcher } from "./dispatcher";

export {
  defaultRealtimeEventMapper,
  mapRealtimeEventToStoreActions,
} from "./map-event";

export {
  createDefaultTransportAdapters,
  createRestTransportAdapter,
  createSseTransportAdapter,
  createWebSocketTransportAdapter,
} from "./transport-adapters";
