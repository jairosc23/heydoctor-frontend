/**
 * CP-28 — VoiceSessionManager.
 * Owns session lifecycle; optional mock transport; no real audio/permissions.
 */

import type { VoiceTransportProvider } from "../contracts";
import { createMockVoiceTransportProvider } from "../mock-provider";
import type { VoiceEngineKind } from "../types";
import type {
  CreateVoiceSessionInput,
  VoiceSessionClock,
  VoiceSessionEventListener,
  VoiceSessionManager,
  VoiceSessionStateListener,
  VoiceSessionTimerHandle,
} from "./contracts";
import { createVoiceSession } from "./session";
import {
  applyVoiceSessionEvent,
  canCancelVoiceSessionManager,
  canCompleteVoiceSession,
  canCreateVoiceSession,
  canPauseVoiceSession,
  canRecoverVoiceSession,
  canResumeVoiceSession,
  canStartVoiceSessionManager,
  createVoiceSessionManagerState,
} from "./state";
import type {
  VoicePermissionStatus,
  VoiceSession,
  VoiceSessionEvent,
  VoiceSessionManagerState,
} from "./types";

export type CreateVoiceSessionManagerOptions = {
  transport?: VoiceTransportProvider | null;
  /** When true (default), attach mock transport if none provided. */
  useMockTransport?: boolean;
  engine?: VoiceEngineKind;
  timeoutMs?: number | null;
  clock?: VoiceSessionClock;
};

function createDefaultClock(): VoiceSessionClock {
  return {
    now: () => new Date().toISOString(),
    setTimeout: (fn, ms) => {
      const id = globalThis.setTimeout(fn, ms) as unknown as number;
      return { id };
    },
    clearTimeout: (handle: VoiceSessionTimerHandle) => {
      globalThis.clearTimeout(
        handle.id as unknown as ReturnType<typeof globalThis.setTimeout>,
      );
    },
  };
}

export function createVoiceSessionManager(
  options: CreateVoiceSessionManagerOptions = {},
): VoiceSessionManager {
  const clock = options.clock ?? createDefaultClock();
  const useMock = options.useMockTransport !== false;
  const transport: VoiceTransportProvider | null =
    options.transport === undefined
      ? useMock
        ? createMockVoiceTransportProvider()
        : null
      : options.transport;

  let state: VoiceSessionManagerState = createVoiceSessionManagerState({
    engine: options.engine ?? transport?.kind ?? "mock",
    timeoutMs: options.timeoutMs ?? null,
  });

  const stateListeners = new Set<VoiceSessionStateListener>();
  const eventListeners = new Set<VoiceSessionEventListener>();
  let timeoutHandle: VoiceSessionTimerHandle | null = null;

  function setState(next: VoiceSessionManagerState): void {
    state = next;
    for (const listener of stateListeners) {
      listener(state);
    }
  }

  function publish(event: VoiceSessionEvent): void {
    setState(applyVoiceSessionEvent(state, event));
    for (const listener of eventListeners) {
      listener(event);
    }
  }

  function clearListeningTimeout(): void {
    if (timeoutHandle) {
      clock.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
  }

  function armListeningTimeout(): void {
    clearListeningTimeout();
    const ms = state.timeoutMs ?? state.session?.timeoutMs ?? null;
    if (ms == null || ms <= 0) return;
    const sessionId = state.session?.sessionId;
    if (!sessionId) return;

    timeoutHandle = clock.setTimeout(() => {
      handleTimeout(sessionId, ms);
    }, ms);
  }

  function handleTimeout(sessionId: string, timeoutMs: number): void {
    if (
      state.session?.sessionId !== sessionId ||
      state.phase !== "listening"
    ) {
      return;
    }
    clearListeningTimeout();
    publish({
      type: "session_timed_out",
      occurredAt: clock.now(),
      sessionId,
      engine: state.engine,
      payload: { sessionId, timeoutMs },
    });
    void transport?.cancel("timeout").catch(() => {
      // Manager already transitioned to timed_out.
    });
  }

  function emitError(error: string, sessionId: string | null = null): void {
    publish({
      type: "session_error",
      occurredAt: clock.now(),
      sessionId,
      engine: state.engine,
      payload: { sessionId, error },
    });
  }

  if (transport) {
    transport.onEvent((event) => {
      const sessionId = state.session?.sessionId ?? event.voiceSessionId;
      const engine = state.engine;
      const occurredAt = event.occurredAt;

      switch (event.type) {
        case "interim_transcript":
          publish({
            type: "interim_transcript",
            occurredAt,
            sessionId,
            engine,
            payload: { text: event.payload.text },
          });
          break;
        case "final_transcript":
          publish({
            type: "final_transcript",
            occurredAt,
            sessionId,
            engine,
            payload: { text: event.payload.text },
          });
          break;
        default:
          break;
      }
    });
  }

  const manager: VoiceSessionManager = {
    getState() {
      return state;
    },

    getSession() {
      return state.session;
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

    createSession(input: CreateVoiceSessionInput = {}): VoiceSession | null {
      if (!canCreateVoiceSession(state.phase)) {
        emitError(
          `cannot_create_from_phase_${state.phase}`,
          state.session?.sessionId ?? null,
        );
        return null;
      }

      clearListeningTimeout();
      const session = createVoiceSession({
        engine: input.engine ?? state.engine,
        permissionStatus: state.permissionStatus,
        createdAt: clock.now(),
        timeoutMs:
          input.timeoutMs !== undefined ? input.timeoutMs : state.timeoutMs,
      });

      publish({
        type: "session_created",
        occurredAt: session.createdAt,
        sessionId: session.sessionId,
        engine: session.engine,
        payload: { session },
      });

      return session;
    },

    async start() {
      if (!canStartVoiceSessionManager(state.phase) || !state.session) {
        emitError(
          `cannot_start_from_phase_${state.phase}`,
          state.session?.sessionId ?? null,
        );
        return;
      }

      const sessionId = state.session.sessionId;
      publish({
        type: "session_starting",
        occurredAt: clock.now(),
        sessionId,
        engine: state.engine,
        payload: { sessionId },
      });

      try {
        if (transport) {
          await transport.start({ voiceSessionId: sessionId });
        }
        publish({
          type: "session_started",
          occurredAt: clock.now(),
          sessionId,
          engine: state.engine,
          payload: { sessionId },
        });
        armListeningTimeout();
      } catch (err) {
        clearListeningTimeout();
        emitError(
          err instanceof Error ? err.message : "voice_session_start_failed",
          sessionId,
        );
      }
    },

    async pause() {
      if (!canPauseVoiceSession(state.phase) || !state.session) {
        emitError(
          `cannot_pause_from_phase_${state.phase}`,
          state.session?.sessionId ?? null,
        );
        return;
      }
      clearListeningTimeout();
      const pauseCount = state.session.pauseCount + 1;
      publish({
        type: "session_paused",
        occurredAt: clock.now(),
        sessionId: state.session.sessionId,
        engine: state.engine,
        payload: {
          sessionId: state.session.sessionId,
          pauseCount,
        },
      });
    },

    async resume() {
      if (!canResumeVoiceSession(state.phase) || !state.session) {
        emitError(
          `cannot_resume_from_phase_${state.phase}`,
          state.session?.sessionId ?? null,
        );
        return;
      }
      const sessionId = state.session.sessionId;
      publish({
        type: "session_resuming",
        occurredAt: clock.now(),
        sessionId,
        engine: state.engine,
        payload: { sessionId },
      });
      publish({
        type: "session_resumed",
        occurredAt: clock.now(),
        sessionId,
        engine: state.engine,
        payload: { sessionId },
      });
      armListeningTimeout();
    },

    async complete() {
      if (!canCompleteVoiceSession(state.phase) || !state.session) {
        emitError(
          `cannot_complete_from_phase_${state.phase}`,
          state.session?.sessionId ?? null,
        );
        return;
      }

      clearListeningTimeout();
      const sessionId = state.session.sessionId;
      publish({
        type: "session_processing",
        occurredAt: clock.now(),
        sessionId,
        engine: state.engine,
        payload: { sessionId },
      });

      try {
        if (transport) {
          await transport.stop();
        }
        const transcript =
          state.session?.finalTranscript ??
          state.session?.interimTranscript ??
          null;
        publish({
          type: "session_completed",
          occurredAt: clock.now(),
          sessionId,
          engine: state.engine,
          payload: { sessionId, transcript },
        });
      } catch (err) {
        emitError(
          err instanceof Error ? err.message : "voice_session_complete_failed",
          sessionId,
        );
      }
    },

    async cancel(reason = null) {
      if (!canCancelVoiceSessionManager(state.phase) || !state.session) {
        return;
      }
      clearListeningTimeout();
      const sessionId = state.session.sessionId;
      try {
        await transport?.cancel(reason);
      } catch {
        // Prefer manager cancel semantics over transport failure.
      }
      publish({
        type: "session_cancelled",
        occurredAt: clock.now(),
        sessionId,
        engine: state.engine,
        payload: { sessionId, reason },
      });
    },

    async recover() {
      if (!canRecoverVoiceSession(state.phase) || !state.session) {
        emitError(
          `cannot_recover_from_phase_${state.phase}`,
          state.session?.sessionId ?? null,
        );
        return;
      }
      const sessionId = state.session.sessionId;
      const fromError = state.session.lastError ?? state.phase;
      publish({
        type: "session_recovering",
        occurredAt: clock.now(),
        sessionId,
        engine: state.engine,
        payload: { sessionId, fromError },
      });
      publish({
        type: "session_recovered",
        occurredAt: clock.now(),
        sessionId,
        engine: state.engine,
        payload: { sessionId },
      });
    },

    setEngine(engine: VoiceEngineKind) {
      publish({
        type: "engine_changed",
        occurredAt: clock.now(),
        sessionId: state.session?.sessionId ?? null,
        engine,
        payload: { engine },
      });
    },

    setPermissionStatus(status: VoicePermissionStatus) {
      publish({
        type: "permission_status_changed",
        occurredAt: clock.now(),
        sessionId: state.session?.sessionId ?? null,
        engine: state.engine,
        payload: { permissionStatus: status },
      });
    },

    setTimeoutMs(timeoutMs: number | null) {
      state = {
        ...state,
        timeoutMs,
        session: state.session
          ? { ...state.session, timeoutMs }
          : state.session,
      };
      for (const listener of stateListeners) {
        listener(state);
      }
      if (state.phase === "listening") {
        armListeningTimeout();
      }
    },

    getTransport() {
      return transport;
    },
  };

  return manager;
}
