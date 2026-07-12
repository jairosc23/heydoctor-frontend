/**
 * CP-27 — Voice Copilot Foundation (public barrel).
 */

export type {
  VoiceCopilotEventListener,
  VoiceCopilotService,
  VoiceCopilotStateListener,
  VoiceTransportProvider,
} from "./contracts";

export type {
  VoiceCopilotEvent,
  VoiceCopilotEventBase,
  VoiceCopilotEventType,
  VoiceCopilotPhase,
  VoiceCopilotState,
  VoiceEngineKind,
} from "./types";

export {
  INITIAL_VOICE_COPILOT_STATE,
  VOICE_ENGINE_KINDS,
} from "./types";

export {
  applyVoiceCopilotEvent,
  canCancelVoiceSession,
  canStartVoiceSession,
  canStopVoiceSession,
  createVoiceCopilotState,
  isVoiceEngineKind,
} from "./state";

export { createMockVoiceTransportProvider } from "./mock-provider";
export { createVoiceCopilotService } from "./service";

/** CP-28 — Voice Session Manager Foundation */
export {
  applyVoiceSessionEvent,
  canCancelVoiceSessionManager,
  canCompleteVoiceSession,
  canCreateVoiceSession,
  canPauseVoiceSession,
  canRecoverVoiceSession,
  canResumeVoiceSession,
  canStartVoiceSessionManager,
  createVoiceSession,
  createVoiceSessionId,
  createVoiceSessionManager,
  createVoiceSessionManagerState,
  INITIAL_VOICE_SESSION_MANAGER_STATE,
  isActiveVoiceSessionPhase,
  isTerminalVoiceSessionPhase,
} from "./session";

export type {
  CreateVoiceSessionInput,
  VoicePermissionStatus,
  VoiceSession,
  VoiceSessionClock,
  VoiceSessionEvent,
  VoiceSessionEventListener,
  VoiceSessionEventType,
  VoiceSessionManager,
  VoiceSessionManagerState,
  VoiceSessionPhase,
  VoiceSessionStateListener,
} from "./session";

/** CP-28 — Speech Provider Abstraction Foundation */
export {
  FUTURE_SPEECH_CAPABILITIES,
  MOCK_SPEECH_CAPABILITIES,
  SPEECH_PROVIDER_IDS,
  WEB_SPEECH_CAPABILITIES,
  attachSpeechProviderToVoicePipeline,
  createDefaultSpeechProviderFactory,
  createMockSpeechProvider,
  createSpeechProviderFactory,
  createSpeechProviderRegistry,
  createStubSpeechProvider,
  createWebSpeechProvider,
  isWebSpeechApiAvailable,
  resolveWebSpeechProvider,
  seedDefaultSpeechProviderRegistry,
} from "./speech";

export type {
  CreateWebSpeechProviderOptions,
  ResolveWebSpeechProviderOptions,
  SpeechProvider,
  SpeechProviderCapabilities,
  SpeechProviderDescriptor,
  SpeechProviderFactory,
  SpeechProviderFactoryFn,
  SpeechProviderId,
  SpeechProviderRegistry,
  SpeechProviderStartInput,
  SpeechProviderStatus,
  WebSpeechRecognitionLike,
} from "./speech";

/** CP-29 — Voice Pipeline Foundation */
export {
  INITIAL_VOICE_PIPELINE_STATUS,
  VOICE_PIPELINE_EVENT_TYPES,
  createVoicePipeline,
  createVoicePipelineDispatcher,
  createVoicePipelineEventId,
  normalizeVoiceCopilotEvent,
} from "./pipeline";

export type {
  VoicePipeline,
  VoicePipelineDispatcher,
  VoicePipelineEvent,
  VoicePipelineEventType,
  VoicePipelineIngestInput,
  VoicePipelineObserver,
  VoicePipelineStage,
  VoicePipelineStatus,
} from "./pipeline";
