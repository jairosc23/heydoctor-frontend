/**
 * CP-28 — Mock SpeechProvider (adapted from Voice Foundation mock transport).
 * No microphone, no STT, no network.
 */

import type { VoiceTransportProvider } from "../contracts";
import {
  createMockVoiceTransportProvider,
  type CreateMockVoiceTransportProviderOptions,
} from "../mock-provider";
import type { SpeechProvider } from "./contracts";
import { MOCK_SPEECH_CAPABILITIES } from "./types";

export type CreateMockSpeechProviderOptions =
  CreateMockVoiceTransportProviderOptions;

export function createMockSpeechProvider(
  options: CreateMockSpeechProviderOptions = {},
): SpeechProvider {
  const transport = createMockVoiceTransportProvider(options);

  const provider: SpeechProvider = {
    id: "mock",
    kind: "mock",
    displayName: "Mock Speech Provider",
    capabilities: MOCK_SPEECH_CAPABILITIES,
    status: "ready",

    start: (input) => transport.start(input),
    stop: () => transport.stop(),
    cancel: (reason) => transport.cancel(reason),
    onEvent: (listener) => transport.onEvent(listener),

    asTransport(): VoiceTransportProvider {
      return transport;
    },
  };

  return provider;
}
