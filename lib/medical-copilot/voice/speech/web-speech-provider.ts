/**
 * CP-30 — WebSpeechProvider (browser Web Speech API — development foundation).
 * Adapts to SpeechProvider contract. No cloud STT vendors.
 */

import type { VoiceCopilotEventListener } from "../contracts";
import type { VoiceTransportProvider } from "../contracts";
import type { VoiceCopilotEvent } from "../types";
import type { SpeechProvider, SpeechProviderStartInput } from "./contracts";
import { createMockSpeechProvider } from "./mock-speech-provider";
import type { SpeechProviderCapabilities } from "./types";
import {
  getWebSpeechRecognitionConstructor,
  isWebSpeechApiAvailable,
  type WebSpeechGlobalScope,
  type WebSpeechRecognitionLike,
} from "./web-speech-detection";

export const WEB_SPEECH_CAPABILITIES: SpeechProviderCapabilities = {
  capturesAudio: true,
  supportsStreaming: false,
  supportsInterimResults: true,
  /** Chrome/Edge typically use a remote recognizer under the hood. */
  requiresNetwork: true,
  requiresApiKey: false,
};

export type CreateWebSpeechProviderOptions = {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  /** Injected scope for feature detection (tests). */
  scope?: WebSpeechGlobalScope;
  /** Injected recognition factory (tests) — bypasses browser API. */
  recognitionFactory?: () => WebSpeechRecognitionLike;
};

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Create a Web Speech provider. Throws if API is unavailable and no factory injected.
 * Prefer `resolveWebSpeechProvider` for automatic mock fallback.
 */
export function createWebSpeechProvider(
  options: CreateWebSpeechProviderOptions = {},
): SpeechProvider {
  const lang = options.lang ?? "es-ES";
  const continuous = options.continuous ?? false;
  const interimResults = options.interimResults !== false;
  const scope = options.scope ?? (globalThis as WebSpeechGlobalScope);

  const RecognitionCtor =
    options.recognitionFactory != null
      ? null
      : getWebSpeechRecognitionConstructor(scope);

  if (!options.recognitionFactory && !RecognitionCtor) {
    throw new Error("web_speech_api_unavailable");
  }

  const listeners = new Set<VoiceCopilotEventListener>();
  let recognition: WebSpeechRecognitionLike | null = null;
  let voiceSessionId: string | null = null;
  let active = false;
  let finalTranscript = "";
  let stopRequested = false;
  let cancelRequested = false;

  function emit(
    partial: Omit<VoiceCopilotEvent, "occurredAt" | "engine" | "voiceSessionId"> &
      Partial<Pick<VoiceCopilotEvent, "voiceSessionId">>,
  ): void {
    const event = {
      ...partial,
      occurredAt: nowIso(),
      engine: "web_speech" as const,
      voiceSessionId:
        partial.voiceSessionId !== undefined
          ? partial.voiceSessionId
          : voiceSessionId,
    } as VoiceCopilotEvent;
    for (const listener of listeners) {
      listener(event);
    }
  }

  function wireRecognition(instance: WebSpeechRecognitionLike): void {
    instance.lang = lang;
    instance.continuous = continuous;
    instance.interimResults = interimResults;

    instance.onstart = () => {
      emit({ type: "listening_started", payload: {} });
    };

    instance.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        const result = ev.results[i];
        if (!result || result.length === 0) continue;
        const text = result[0]?.transcript?.trim() ?? "";
        if (!text) continue;
        if (result.isFinal) {
          finalTranscript = finalTranscript
            ? `${finalTranscript} ${text}`.trim()
            : text;
          emit({
            type: "final_transcript",
            payload: { text: finalTranscript },
          });
        } else {
          emit({
            type: "interim_transcript",
            payload: { text },
          });
        }
      }
    };

    instance.onerror = (ev) => {
      active = false;
      emit({
        type: "session_error",
        payload: { error: ev.error || "web_speech_error" },
      });
    };

    instance.onend = () => {
      const wasCancel = cancelRequested;
      const wasStop = stopRequested;
      active = false;
      cancelRequested = false;
      stopRequested = false;

      if (wasCancel) {
        emit({
          type: "session_cancelled",
          payload: { reason: "user_abort" },
        });
        voiceSessionId = null;
        return;
      }

      if (wasStop || finalTranscript) {
        emit({ type: "processing_started", payload: {} });
        if (finalTranscript) {
          emit({
            type: "final_transcript",
            payload: { text: finalTranscript },
          });
        }
        emit({
          type: "session_completed",
          payload: { transcript: finalTranscript || null },
        });
      }
      voiceSessionId = null;
    };
  }

  function createRecognition(): WebSpeechRecognitionLike {
    if (options.recognitionFactory) {
      return options.recognitionFactory();
    }
    return new RecognitionCtor!();
  }

  const provider: SpeechProvider = {
    id: "web_speech",
    kind: "web_speech",
    displayName: "Web Speech API",
    capabilities: WEB_SPEECH_CAPABILITIES,
    status: "ready",

    async start(input: SpeechProviderStartInput) {
      if (active) {
        emit({
          type: "session_error",
          voiceSessionId: input.voiceSessionId,
          payload: { error: "web_speech_already_active" },
        });
        return;
      }

      voiceSessionId = input.voiceSessionId;
      finalTranscript = "";
      stopRequested = false;
      cancelRequested = false;
      active = true;

      emit({
        type: "session_starting",
        voiceSessionId: input.voiceSessionId,
        payload: { voiceSessionId: input.voiceSessionId },
      });

      try {
        recognition = createRecognition();
        wireRecognition(recognition);
        recognition.start();
      } catch (err) {
        active = false;
        emit({
          type: "session_error",
          voiceSessionId: input.voiceSessionId,
          payload: {
            error:
              err instanceof Error ? err.message : "web_speech_start_failed",
          },
        });
      }
    },

    async stop() {
      if (!recognition || !active) return;
      stopRequested = true;
      try {
        recognition.stop();
      } catch (err) {
        emit({
          type: "session_error",
          payload: {
            error:
              err instanceof Error ? err.message : "web_speech_stop_failed",
          },
        });
      }
    },

    async cancel(reason = null) {
      if (!recognition) {
        if (active || voiceSessionId) {
          active = false;
          emit({
            type: "session_cancelled",
            payload: { reason },
          });
          voiceSessionId = null;
        }
        return;
      }
      cancelRequested = true;
      try {
        recognition.abort();
      } catch {
        emit({
          type: "session_cancelled",
          payload: { reason },
        });
        active = false;
        voiceSessionId = null;
      }
    },

    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    asTransport(): VoiceTransportProvider {
      return {
        kind: "web_speech",
        capturesAudio: true,
        start: (input) => provider.start(input),
        stop: () => provider.stop(),
        cancel: (reason) => provider.cancel(reason),
        onEvent: (listener) => provider.onEvent(listener),
      };
    },
  };

  return provider;
}

export type ResolveWebSpeechProviderOptions = CreateWebSpeechProviderOptions & {
  /** Mock factory used when Web Speech API is unavailable. */
  createFallback?: () => SpeechProvider;
};

/**
 * Prefer Web Speech when available; otherwise return Mock provider.
 */
export function resolveWebSpeechProvider(
  options: ResolveWebSpeechProviderOptions = {},
): SpeechProvider {
  const scope = options.scope ?? (globalThis as WebSpeechGlobalScope);
  const available =
    options.recognitionFactory != null || isWebSpeechApiAvailable(scope);

  if (!available) {
    return (
      options.createFallback?.() ??
      createMockSpeechProvider({
        mockTranscript:
          "Fallback mock transcript — Web Speech API unavailable",
      })
    );
  }

  return createWebSpeechProvider(options);
}
