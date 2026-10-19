/**
 * CP-29 — Voice Pipeline Foundation (public barrel).
 */

export type {
  VoicePipeline,
  VoicePipelineDispatcher,
  VoicePipelineIngestInput,
  VoicePipelineObserver,
} from "./contracts";

export type {
  VoicePipelineEvent,
  VoicePipelineEventBase,
  VoicePipelineEventType,
  VoicePipelineStage,
  VoicePipelineStatus,
} from "./types";

export {
  INITIAL_VOICE_PIPELINE_STATUS,
  VOICE_PIPELINE_EVENT_TYPES,
} from "./types";

export {
  createVoicePipelineEventId,
  normalizeVoiceCopilotEvent,
} from "./normalize";

export { createVoicePipelineDispatcher } from "./dispatcher";
export { createVoicePipeline } from "./pipeline";
