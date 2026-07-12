/**
 * CP-28 — Stub SpeechProviders for future engines (same contract, not connected).
 */

import type { VoiceCopilotEventListener } from "../contracts";
import type { VoiceTransportProvider } from "../contracts";
import type { VoiceCopilotEvent } from "../types";
import type { VoiceEngineKind } from "../types";
import type { SpeechProvider } from "./contracts";
import type {
  SpeechProviderCapabilities,
  SpeechProviderId,
} from "./types";
import { FUTURE_SPEECH_CAPABILITIES } from "./types";

export type CreateStubSpeechProviderOptions = {
  id: SpeechProviderId;
  kind: VoiceEngineKind;
  displayName: string;
  capabilities?: SpeechProviderCapabilities;
};

/**
 * Placeholder provider — implements SpeechProvider but rejects runtime use.
 * Real wiring arrives in CP-29+.
 */
export function createStubSpeechProvider(
  options: CreateStubSpeechProviderOptions,
): SpeechProvider {
  const capabilities =
    options.capabilities ?? FUTURE_SPEECH_CAPABILITIES;
  const listeners = new Set<VoiceCopilotEventListener>();

  function emitError(voiceSessionId: string | null, error: string): void {
    const event: VoiceCopilotEvent = {
      type: "session_error",
      occurredAt: new Date().toISOString(),
      engine: options.kind,
      voiceSessionId,
      payload: { error },
    };
    for (const listener of listeners) {
      listener(event);
    }
  }

  const provider: SpeechProvider = {
    id: options.id,
    kind: options.kind,
    displayName: options.displayName,
    capabilities: {
      ...capabilities,
      capturesAudio: false,
    },
    status: "unconfigured",

    async start(input) {
      emitError(
        input.voiceSessionId,
        `${options.id}_not_implemented`,
      );
      throw new Error(`${options.id}_not_implemented`);
    },

    async stop() {
      // no-op
    },

    async cancel() {
      // no-op
    },

    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    asTransport(): VoiceTransportProvider {
      return {
        kind: options.kind,
        capturesAudio: false,
        start: (input) => provider.start(input),
        stop: () => provider.stop(),
        cancel: (reason) => provider.cancel(reason),
        onEvent: (listener) => provider.onEvent(listener),
      };
    },
  };

  return provider;
}
