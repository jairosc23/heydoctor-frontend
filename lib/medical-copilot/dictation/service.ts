/**
 * CP-31 — ClinicalDictationService.
 * Orchestrates SpeechProvider → in-memory dictation buffer.
 * Does not touch Store, SOAP, Pipeline internals, or backend.
 */

import type { SpeechProvider } from "@/lib/medical-copilot/voice/speech/contracts";
import { resolveWebSpeechProvider } from "@/lib/medical-copilot/voice/speech/web-speech-provider";
import type { VoiceCopilotEvent } from "@/lib/medical-copilot/voice/types";
import {
  applyFinalTranscript,
  applyPartialTranscript,
  clearDictationBuffer,
  createEmptyDictationBuffer,
  setDictationDraft,
} from "./buffer";
import type {
  ClinicalDictationState,
  DictationSession,
  DictationStatus,
} from "./types";
import { INITIAL_CLINICAL_DICTATION_STATE } from "./types";

export type ClinicalDictationStateListener = (
  state: ClinicalDictationState,
) => void;

export type CreateClinicalDictationServiceOptions = {
  speechProvider?: SpeechProvider;
  consultationId?: string | null;
};

function createSessionId(): string {
  return `dict_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isActiveStatus(status: DictationStatus): boolean {
  return (
    status === "starting" ||
    status === "listening" ||
    status === "paused" ||
    status === "finalizing"
  );
}

export interface ClinicalDictationService {
  getState(): ClinicalDictationState;
  subscribe(listener: ClinicalDictationStateListener): () => void;
  start(input?: { consultationId?: string | null }): Promise<void>;
  stop(): Promise<void>;
  cancel(reason?: string | null): Promise<void>;
  clearBuffer(): void;
  setDraft(draft: string): void;
  /** Mark session completed without speech stop (after stop already ended). */
  finalize(): void;
  reset(): void;
}

export function createClinicalDictationService(
  options: CreateClinicalDictationServiceOptions = {},
): ClinicalDictationService {
  const provider = options.speechProvider ?? resolveWebSpeechProvider();
  let consultationId = options.consultationId ?? null;

  let state: ClinicalDictationState = {
    ...INITIAL_CLINICAL_DICTATION_STATE,
    buffer: createEmptyDictationBuffer(),
  };

  const listeners = new Set<ClinicalDictationStateListener>();
  let unsubscribeSpeech: (() => void) | null = null;

  function setState(next: ClinicalDictationState): void {
    state = {
      ...next,
      active: isActiveStatus(next.status),
    };
    for (const listener of listeners) {
      listener(state);
    }
  }

  function patchSession(
    patch: Partial<DictationSession>,
  ): DictationSession | null {
    if (!state.session) return null;
    return { ...state.session, ...patch };
  }

  function handleSpeechEvent(event: VoiceCopilotEvent): void {
    switch (event.type) {
      case "session_starting":
        setState({
          ...state,
          status: "starting",
          session: patchSession({ status: "starting" }) ?? state.session,
        });
        break;
      case "listening_started":
        setState({
          ...state,
          status: "listening",
          session: patchSession({
            status: "listening",
            startedAt: state.session?.startedAt ?? event.occurredAt,
          }),
        });
        break;
      case "interim_transcript":
        setState({
          ...state,
          buffer: applyPartialTranscript(state.buffer, event.payload.text),
        });
        break;
      case "final_transcript":
        setState({
          ...state,
          buffer: applyFinalTranscript(state.buffer, event.payload.text),
        });
        break;
      case "processing_started":
        setState({
          ...state,
          status: "finalizing",
          session: patchSession({ status: "finalizing" }),
        });
        break;
      case "session_completed":
        setState({
          ...state,
          status: "completed",
          buffer: {
            ...state.buffer,
            partial: null,
            draft: state.buffer.draft || event.payload.transcript || "",
          },
          session: patchSession({
            status: "completed",
            endedAt: event.occurredAt,
            error: null,
          }),
        });
        break;
      case "session_cancelled":
        setState({
          ...state,
          status: "cancelled",
          buffer: {
            ...state.buffer,
            partial: null,
          },
          session: patchSession({
            status: "cancelled",
            endedAt: event.occurredAt,
          }),
        });
        break;
      case "session_error":
        setState({
          ...state,
          status: "error",
          session: patchSession({
            status: "error",
            error: event.payload.error,
            endedAt: event.occurredAt,
          }),
        });
        break;
      default:
        break;
    }
  }

  function ensureSpeechSubscription(): void {
    if (unsubscribeSpeech) return;
    unsubscribeSpeech = provider.onEvent(handleSpeechEvent);
  }

  const service: ClinicalDictationService = {
    getState() {
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },

    async start(input) {
      if (isActiveStatus(state.status)) {
        setState({
          ...state,
          status: "error",
          session: patchSession({
            status: "error",
            error: "dictation_already_active",
          }),
        });
        return;
      }

      if (input?.consultationId !== undefined) {
        consultationId = input.consultationId;
      }

      const sessionId = createSessionId();
      const createdAt = new Date().toISOString();
      const session: DictationSession = {
        sessionId,
        status: "starting",
        consultationId,
        createdAt,
        startedAt: null,
        endedAt: null,
        error: null,
        providerId: provider.id,
      };

      setState({
        session,
        buffer: createEmptyDictationBuffer(),
        status: "starting",
        active: true,
      });

      ensureSpeechSubscription();
      await provider.start({ voiceSessionId: sessionId });
    },

    async stop() {
      if (!isActiveStatus(state.status) && state.status !== "listening") {
        return;
      }
      setState({
        ...state,
        status: "finalizing",
        session: patchSession({ status: "finalizing" }),
      });
      await provider.stop();
    },

    async cancel(reason = null) {
      if (state.status === "idle") return;
      await provider.cancel(reason);
      if (state.status !== "cancelled" && state.status !== "completed") {
        setState({
          ...state,
          status: "cancelled",
          buffer: {
            ...state.buffer,
            partial: null,
          },
          session: patchSession({
            status: "cancelled",
            endedAt: new Date().toISOString(),
          }),
        });
      }
    },

    clearBuffer() {
      setState({
        ...state,
        buffer: clearDictationBuffer(),
      });
    },

    setDraft(draft: string) {
      setState({
        ...state,
        buffer: setDictationDraft(state.buffer, draft),
      });
    },

    finalize() {
      if (state.status === "completed" || state.status === "idle") return;
      setState({
        ...state,
        status: "completed",
        buffer: {
          ...state.buffer,
          partial: null,
        },
        session: patchSession({
          status: "completed",
          endedAt: new Date().toISOString(),
        }),
      });
    },

    reset() {
      setState({
        ...INITIAL_CLINICAL_DICTATION_STATE,
        buffer: createEmptyDictationBuffer(),
      });
    },
  };

  return service;
}
