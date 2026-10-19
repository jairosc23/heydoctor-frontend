/**
 * CP-30 — Bridge SpeechProvider → VoicePipeline without modifying either contract.
 */

import type { VoicePipeline } from "../pipeline/contracts";
import type { SpeechProvider } from "./contracts";

/**
 * Forward SpeechProvider VoiceCopilotEvents into the Voice Pipeline.
 * Returns an unsubscribe function.
 */
export function attachSpeechProviderToVoicePipeline(
  provider: SpeechProvider,
  pipeline: VoicePipeline,
): () => void {
  return provider.onEvent((event) => {
    pipeline.push({ kind: "copilot", event });
  });
}
