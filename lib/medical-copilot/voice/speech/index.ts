/**
 * CP-28 — Speech Provider Abstraction Foundation (public barrel).
 * CP-30 — Web Speech Provider exports.
 */

export type {
  SpeechProvider,
  SpeechProviderFactory,
  SpeechProviderFactoryFn,
  SpeechProviderRegistry,
  SpeechProviderStartInput,
} from "./contracts";

export type {
  SpeechProviderCapabilities,
  SpeechProviderDescriptor,
  SpeechProviderId,
  SpeechProviderStatus,
} from "./types";

export {
  FUTURE_SPEECH_CAPABILITIES,
  MOCK_SPEECH_CAPABILITIES,
  SPEECH_PROVIDER_IDS,
} from "./types";

export { createMockSpeechProvider } from "./mock-speech-provider";
export { createStubSpeechProvider } from "./stub-speech-provider";
export { createSpeechProviderRegistry } from "./registry";
export {
  createDefaultSpeechProviderFactory,
  createSpeechProviderFactory,
  seedDefaultSpeechProviderRegistry,
} from "./factory";

export {
  getWebSpeechRecognitionConstructor,
  isWebSpeechApiAvailable,
} from "./web-speech-detection";
export type {
  WebSpeechGlobalScope,
  WebSpeechRecognitionEventLike,
  WebSpeechRecognitionLike,
} from "./web-speech-detection";

export {
  WEB_SPEECH_CAPABILITIES,
  createWebSpeechProvider,
  resolveWebSpeechProvider,
} from "./web-speech-provider";
export type {
  CreateWebSpeechProviderOptions,
  ResolveWebSpeechProviderOptions,
} from "./web-speech-provider";

export { attachSpeechProviderToVoicePipeline } from "./attach-to-pipeline";
