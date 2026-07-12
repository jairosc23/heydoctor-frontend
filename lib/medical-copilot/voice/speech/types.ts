/**
 * CP-28 — Speech Provider Abstraction types.
 * No real STT/TTS — contract + metadata only.
 */

import type { VoiceEngineKind } from "../types";

export type SpeechProviderId =
  | "mock"
  | "web_speech"
  | "openai_realtime"
  | "deepgram"
  | "azure_speech"
  | "google_speech";

export type SpeechProviderStatus =
  | "ready"
  | "unavailable"
  | "unconfigured";

export type SpeechProviderCapabilities = {
  /** True only when a real mic capture path is wired (never in CP-28). */
  capturesAudio: boolean;
  supportsStreaming: boolean;
  supportsInterimResults: boolean;
  requiresNetwork: boolean;
  requiresApiKey: boolean;
};

export type SpeechProviderDescriptor = {
  id: SpeechProviderId;
  kind: VoiceEngineKind;
  displayName: string;
  capabilities: SpeechProviderCapabilities;
  /** Whether the registry can instantiate a usable provider today. */
  implemented: boolean;
};

export const SPEECH_PROVIDER_IDS: readonly SpeechProviderId[] = [
  "mock",
  "web_speech",
  "openai_realtime",
  "deepgram",
  "azure_speech",
  "google_speech",
] as const;

export const MOCK_SPEECH_CAPABILITIES: SpeechProviderCapabilities = {
  capturesAudio: false,
  supportsStreaming: false,
  supportsInterimResults: true,
  requiresNetwork: false,
  requiresApiKey: false,
};

export const FUTURE_SPEECH_CAPABILITIES: SpeechProviderCapabilities = {
  capturesAudio: false,
  supportsStreaming: false,
  supportsInterimResults: false,
  requiresNetwork: true,
  requiresApiKey: true,
};
