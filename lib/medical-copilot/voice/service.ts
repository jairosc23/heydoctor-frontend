/**
 * CP-27 — VoiceCopilotService.
 * Owns lifecycle; delegates transport to VoiceTransportProvider (mock by default).
 * Does not touch MedicalCopilotStore or capture real audio.
 */

import type {
  VoiceCopilotEventListener,
  VoiceCopilotService,
  VoiceCopilotStateListener,
  VoiceTransportProvider,
} from "./contracts";
import { createMockVoiceTransportProvider } from "./mock-provider";
import {
  applyVoiceCopilotEvent,
  canCancelVoiceSession,
  canStartVoiceSession,
  canStopVoiceSession,
  createVoiceCopilotState,
} from "./state";
import type {
  VoiceCopilotEvent,
  VoiceCopilotState,
  VoiceEngineKind,
} from "./types";
import { INITIAL_VOICE_COPILOT_STATE } from "./types";

export type CreateVoiceCopilotServiceOptions = {
  provider?: VoiceTransportProvider;
  /** Logical preferred engine for CP-28; runtime provider stays mock until wired. */
  preferredEngine?: VoiceEngineKind;
};

function createVoiceSessionId(): string {
  return `voice_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createVoiceCopilotService(
  options: CreateVoiceCopilotServiceOptions = {},
): VoiceCopilotService {
  const provider = options.provider ?? createMockVoiceTransportProvider();
  let state: VoiceCopilotState = createVoiceCopilotState({
    engine: options.preferredEngine ?? provider.kind,
  });

  const stateListeners = new Set<VoiceCopilotStateListener>();
  const eventListeners = new Set<VoiceCopilotEventListener>();

  function setState(next: VoiceCopilotState): void {
    state = next;
    for (const listener of stateListeners) {
      listener(state);
    }
  }

  function publish(event: VoiceCopilotEvent): void {
    setState(applyVoiceCopilotEvent(state, event));
    for (const listener of eventListeners) {
      listener(event);
    }
  }

  provider.onEvent((event) => {
    // Preserve logical engine preference; transport mock always reports kind "mock".
    publish({ ...event, engine: state.engine });
  });

  return {
    getState() {
      return state;
    },

    subscribe(listener) {
      stateListeners.add(listener);
      listener(state);
      return () => {
        stateListeners.delete(listener);
      };
    },

    onEvent(listener) {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },

    async start() {
      if (!canStartVoiceSession(state.phase)) {
        publish({
          type: "session_error",
          occurredAt: new Date().toISOString(),
          engine: state.engine,
          voiceSessionId: state.voiceSessionId,
          payload: {
            error: `cannot_start_from_phase_${state.phase}`,
          },
        });
        return;
      }

      const voiceSessionId = createVoiceSessionId();
      try {
        await provider.start({ voiceSessionId });
      } catch (err) {
        publish({
          type: "session_error",
          occurredAt: new Date().toISOString(),
          engine: state.engine,
          voiceSessionId,
          payload: {
            error: err instanceof Error ? err.message : "voice_start_failed",
          },
        });
      }
    },

    async stop() {
      if (!canStopVoiceSession(state.phase)) {
        return;
      }
      try {
        await provider.stop();
      } catch (err) {
        publish({
          type: "session_error",
          occurredAt: new Date().toISOString(),
          engine: state.engine,
          voiceSessionId: state.voiceSessionId,
          payload: {
            error: err instanceof Error ? err.message : "voice_stop_failed",
          },
        });
      }
    },

    async cancel(reason = null) {
      if (!canCancelVoiceSession(state.phase)) {
        return;
      }
      try {
        await provider.cancel(reason);
      } catch (err) {
        publish({
          type: "session_error",
          occurredAt: new Date().toISOString(),
          engine: state.engine,
          voiceSessionId: state.voiceSessionId,
          payload: {
            error: err instanceof Error ? err.message : "voice_cancel_failed",
          },
        });
      }
    },

    reset() {
      setState({
        ...INITIAL_VOICE_COPILOT_STATE,
        engine: state.engine,
      });
    },

    setEngine(engine: VoiceEngineKind) {
      publish({
        type: "engine_changed",
        occurredAt: new Date().toISOString(),
        engine,
        voiceSessionId: state.voiceSessionId,
        payload: { engine },
      });
    },

    getEngine() {
      return state.engine;
    },
  };
}
