/**
 * CP-34 — Integration helpers (cableado only).
 * Wires Dictation context → Clinical Intelligence Adapter request.
 */

import type { ClinicalAnalysisRequest } from "./types";

export type BuildGovernedAnalysisRequestInput = {
  consultationId: string;
  patientId: string;
  sessionId?: string | null;
  /** Opaque dictation draft — not interpreted locally as a prompt. */
  dictationDraft?: string | null;
  timeoutMs?: number;
};

/**
 * Builds a ClinicalAnalysisRequest from existing UI/session/dictation state.
 * Does not invent new contracts or prompts.
 */
export function buildGovernedAnalysisRequest(
  input: BuildGovernedAnalysisRequestInput,
): ClinicalAnalysisRequest {
  const draft = input.dictationDraft?.trim() || undefined;
  return {
    consultationId: input.consultationId,
    patientId: input.patientId,
    sessionId: input.sessionId?.trim() || undefined,
    contextNote: draft,
    timeoutMs: input.timeoutMs,
  };
}
