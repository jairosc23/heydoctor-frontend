/**
 * CP-26 — Public contracts for Realtime Synchronization.
 * Adapters never touch UI; they only emit RealtimeEvent → Store actions.
 */

import type {
  MedicalCopilotDataSource,
  MedicalCopilotRefreshPayload,
  MedicalCopilotState,
  MedicalCopilotStoreAction,
} from "../store-types";
import type {
  RealtimeConnectionState,
  RealtimeEvent,
} from "./types";

export type MedicalCopilotStoreDispatch = (
  action: MedicalCopilotStoreAction,
) => void;

export type MedicalCopilotStoreGetState = () => MedicalCopilotState;

/** Maps a realtime event to zero or more existing Store actions. */
export interface RealtimeEventMapper {
  map(
    event: RealtimeEvent,
    getState: MedicalCopilotStoreGetState,
  ): MedicalCopilotStoreAction[];
}

/** Normalizes + dispatches RealtimeEvent onto the Store reducer. */
export interface RealtimeEventDispatcher {
  attach(
    dispatch: MedicalCopilotStoreDispatch,
    getState: MedicalCopilotStoreGetState,
  ): void;
  detach(): void;
  /** Returns the store actions that were dispatched (empty if detached). */
  dispatchEvent(event: RealtimeEvent): MedicalCopilotStoreAction[];
}

/**
 * Transport-specific producer. Inactive transports stay as stubs until
 * SSE/WebSocket are enabled in a later CP.
 */
export interface MedicalCopilotTransportAdapter {
  readonly kind: MedicalCopilotDataSource;
  /** Whether this transport is allowed to emit events. */
  readonly active: boolean;
  start(): void;
  stop(): void;
  /**
   * Optional hook for push transports. REST adapter uses ingest helpers
   * on MedicalCopilotRealtimeAdapter instead.
   */
  onEvent?(listener: (event: RealtimeEvent) => void): () => void;
}

/**
 * Facade that receives external events, normalizes them, and dispatches
 * identical Store actions regardless of transport (REST / SSE / WS / Voice).
 */
export interface MedicalCopilotRealtimeAdapter {
  readonly connectionState: RealtimeConnectionState;
  attach(
    dispatch: MedicalCopilotStoreDispatch,
    getState: MedicalCopilotStoreGetState,
  ): void;
  detach(): void;
  /** Ingest a single normalized realtime event. */
  ingest(event: RealtimeEvent): MedicalCopilotStoreAction[];
  /** Ingest a batch of events in order. */
  ingestMany(events: RealtimeEvent[]): MedicalCopilotStoreAction[];
  /**
   * Apply a full REST refresh as ordered RealtimeEvents
   * (workspace → timeline → memory+actions).
   */
  ingestRestRefresh(payload: MedicalCopilotRefreshPayload): MedicalCopilotStoreAction[];
  /** Switch logical dataSource without activating real SSE/WS sockets. */
  setDataSource(dataSource: MedicalCopilotDataSource): void;
  getTransport(kind: MedicalCopilotDataSource): MedicalCopilotTransportAdapter;
}
