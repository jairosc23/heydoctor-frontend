/**
 * S3 — When to use validate-echo vs assertContinuityHydrationDraft.
 *
 * Sole Composer hydrate contract: ClinicalAssistPrefillDraft (T1).
 */

import type { PassiveContinuityHint } from "./types";

export type ContinuityHydrationGate =
  | "validate-echo"
  | "assertContinuityHydrationDraft";

export function resolveContinuityHydrationGate(
  hint: PassiveContinuityHint,
): ContinuityHydrationGate {
  if (hint.sourceKind === "clinical_protocol") {
    return "validate-echo";
  }
  // continuity_active | continuity_timeline | manual | tk (C0 continuity path)
  return "assertContinuityHydrationDraft";
}

export const CONTINUITY_HYDRATION_POLICY_DOC = `
S3 Policy:
- clinical_protocol → POST /api/clinical-assist/intake/validate (validate-echo), then hydrateFromAssistDraft
- continuity_active | continuity_timeline | manual → assertContinuityHydrationDraft (FE), skip validate-echo
- Never hydrate CompositionState without one of these gates
- Never bypass Confirmation Gate on emit (Composer M2)
`.trim();
