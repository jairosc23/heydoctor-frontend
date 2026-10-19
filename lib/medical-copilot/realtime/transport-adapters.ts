/**
 * CP-26 — Transport adapters (REST active; SSE/WebSocket inactive stubs).
 */

import type { MedicalCopilotDataSource } from "../store-types";
import type { MedicalCopilotTransportAdapter } from "./contracts";
import type { RealtimeEvent } from "./types";

type Listener = (event: RealtimeEvent) => void;

function createInactivePushAdapter(
  kind: Exclude<MedicalCopilotDataSource, "rest">,
): MedicalCopilotTransportAdapter {
  let started = false;
  const listeners = new Set<Listener>();

  return {
    kind,
    get active() {
      // Intentionally inactive until a later CP enables real SSE/WS.
      return false;
    },
    start() {
      started = true;
      void started;
    },
    stop() {
      started = false;
      listeners.clear();
    },
    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * REST transport — active today. Does not open sockets; producers call
 * MedicalCopilotRealtimeAdapter.ingest() with REST-derived events.
 */
export function createRestTransportAdapter(): MedicalCopilotTransportAdapter {
  let started = false;
  const listeners = new Set<Listener>();

  return {
    kind: "rest",
    get active() {
      return true;
    },
    start() {
      started = true;
      void started;
    },
    stop() {
      started = false;
      listeners.clear();
    },
    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** SSE stub — prepared, not connected. */
export function createSseTransportAdapter(): MedicalCopilotTransportAdapter {
  return createInactivePushAdapter("sse");
}

/** WebSocket stub — prepared, not connected. */
export function createWebSocketTransportAdapter(): MedicalCopilotTransportAdapter {
  return createInactivePushAdapter("websocket");
}

export function createDefaultTransportAdapters(): Record<
  MedicalCopilotDataSource,
  MedicalCopilotTransportAdapter
> {
  return {
    rest: createRestTransportAdapter(),
    sse: createSseTransportAdapter(),
    websocket: createWebSocketTransportAdapter(),
  };
}
