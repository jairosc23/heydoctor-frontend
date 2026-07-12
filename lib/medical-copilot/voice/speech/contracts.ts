/**
 * CP-28 — Public contracts for Speech Provider Abstraction.
 * All engines implement the same SpeechProvider surface.
 */

import type { VoiceTransportProvider } from "../contracts";
import type { VoiceCopilotEventListener } from "../contracts";
import type {
  SpeechProviderCapabilities,
  SpeechProviderDescriptor,
  SpeechProviderId,
  SpeechProviderStatus,
} from "./types";
import type { VoiceEngineKind } from "../types";

export type SpeechProviderStartInput = {
  voiceSessionId: string;
};

/**
 * Unified speech engine contract.
 * Future Web Speech / Deepgram / OpenAI / Azure / Google plug in here.
 */
export interface SpeechProvider {
  readonly id: SpeechProviderId;
  readonly kind: VoiceEngineKind;
  readonly displayName: string;
  readonly capabilities: SpeechProviderCapabilities;
  readonly status: SpeechProviderStatus;
  start(input: SpeechProviderStartInput): Promise<void>;
  stop(): Promise<void>;
  cancel(reason?: string | null): Promise<void>;
  onEvent(listener: VoiceCopilotEventListener): () => void;
  /**
   * Bridge to CP-27 VoiceTransportProvider without changing VoiceCopilotService.
   */
  asTransport(): VoiceTransportProvider;
}

export type SpeechProviderFactoryFn = () => SpeechProvider;

export interface SpeechProviderFactory {
  /** Create a provider instance by id (uses registry definitions). */
  create(id: SpeechProviderId): SpeechProvider;
  /** Default runtime provider for CP-28 — always mock. */
  createDefault(): SpeechProvider;
  /** List descriptors known to the bound registry. */
  list(): SpeechProviderDescriptor[];
}

export interface SpeechProviderRegistry {
  register(
    descriptor: SpeechProviderDescriptor,
    factory: SpeechProviderFactoryFn,
  ): void;
  unregister(id: SpeechProviderId): void;
  has(id: SpeechProviderId): boolean;
  getFactory(id: SpeechProviderId): SpeechProviderFactoryFn | null;
  getDescriptor(id: SpeechProviderId): SpeechProviderDescriptor | null;
  listDescriptors(): SpeechProviderDescriptor[];
  listIds(): SpeechProviderId[];
}
