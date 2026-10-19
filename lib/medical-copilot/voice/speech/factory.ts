/**
 * CP-28 — SpeechProviderFactory + default registry seed.
 * CP-30 — web_speech registered as implemented (with mock fallback).
 */

import type { VoiceEngineKind } from "../types";
import type {
  SpeechProvider,
  SpeechProviderFactory,
  SpeechProviderRegistry,
} from "./contracts";
import { createMockSpeechProvider } from "./mock-speech-provider";
import { createSpeechProviderRegistry } from "./registry";
import { createStubSpeechProvider } from "./stub-speech-provider";
import type { SpeechProviderId } from "./types";
import {
  FUTURE_SPEECH_CAPABILITIES,
  MOCK_SPEECH_CAPABILITIES,
} from "./types";
import { isWebSpeechApiAvailable } from "./web-speech-detection";
import {
  resolveWebSpeechProvider,
  WEB_SPEECH_CAPABILITIES,
} from "./web-speech-provider";

const FUTURE_CLOUD_PROVIDERS: Array<{
  id: Exclude<SpeechProviderId, "mock" | "web_speech">;
  kind: VoiceEngineKind;
  displayName: string;
}> = [
  {
    id: "openai_realtime",
    kind: "openai_realtime",
    displayName: "OpenAI Realtime",
  },
  {
    id: "deepgram",
    kind: "deepgram",
    displayName: "Deepgram",
  },
  {
    id: "azure_speech",
    kind: "azure_speech",
    displayName: "Azure Speech",
  },
  {
    id: "google_speech",
    kind: "google_speech",
    displayName: "Google Speech",
  },
];

export function seedDefaultSpeechProviderRegistry(
  registry: SpeechProviderRegistry = createSpeechProviderRegistry(),
): SpeechProviderRegistry {
  registry.register(
    {
      id: "mock",
      kind: "mock",
      displayName: "Mock Speech Provider",
      capabilities: MOCK_SPEECH_CAPABILITIES,
      implemented: true,
    },
    () => createMockSpeechProvider(),
  );

  registry.register(
    {
      id: "web_speech",
      kind: "web_speech",
      displayName: "Web Speech API",
      capabilities: WEB_SPEECH_CAPABILITIES,
      // Implemented in CP-30; runtime may still fall back to mock when API missing.
      implemented: true,
    },
    () => resolveWebSpeechProvider(),
  );

  for (const entry of FUTURE_CLOUD_PROVIDERS) {
    registry.register(
      {
        id: entry.id,
        kind: entry.kind,
        displayName: entry.displayName,
        capabilities: FUTURE_SPEECH_CAPABILITIES,
        implemented: false,
      },
      () =>
        createStubSpeechProvider({
          id: entry.id,
          kind: entry.kind,
          displayName: entry.displayName,
        }),
    );
  }

  return registry;
}

export type CreateSpeechProviderFactoryOptions = {
  registry?: SpeechProviderRegistry;
};

export function createSpeechProviderFactory(
  options: CreateSpeechProviderFactoryOptions = {},
): SpeechProviderFactory {
  const registry =
    options.registry ?? seedDefaultSpeechProviderRegistry();

  return {
    create(id: SpeechProviderId): SpeechProvider {
      const factory = registry.getFactory(id);
      if (!factory) {
        throw new Error(`speech_provider_not_registered:${id}`);
      }
      return factory();
    },

    createDefault(): SpeechProvider {
      // Development preference: Web Speech when available, else mock.
      if (isWebSpeechApiAvailable()) {
        return resolveWebSpeechProvider();
      }
      return this.create("mock");
    },

    list() {
      return registry.listDescriptors();
    },
  };
}

/** Convenience: factory bound to the default seeded registry. */
export function createDefaultSpeechProviderFactory(): SpeechProviderFactory {
  return createSpeechProviderFactory();
}
