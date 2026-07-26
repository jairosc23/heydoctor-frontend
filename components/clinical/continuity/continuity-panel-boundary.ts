/**
 * I4 / I5 — Continuity Panel import boundary (C1).
 * Allowed continuity-platform paths: types only (and never barrel / hydration).
 */

export const CONTINUITY_C1_DIR = "components/clinical/continuity";

/** Forbidden import substrings (Composer / writes / C0 hydration). */
export const CONTINUITY_C1_FORBIDDEN_IMPORT_PATTERNS = [
  "@/lib/composer-intake",
  "lib/composer-intake",
  "ClinicalAssistPrefillDraft",
  "confirmAndEmit",
  "hydrateFromAssistDraft",
  "createPrescription",
  "@/lib/services/prescriptions",
  "lib/services/prescriptions",
  "renewPrescription",
  "/renew",
  "POST /prescriptions",
  "@/lib/continuity-platform\"",
  "@/lib/continuity-platform'",
  "@/lib/continuity-platform`",
  "continuity-platform/index",
  "continuity-platform/adapter",
  "continuity-platform/assert-hydration-draft",
  "continuity-platform/hydration-policy",
  "toClinicalAssistPrefillDraft",
  "assertContinuityHydrationDraft",
  "resolveContinuityHydrationGate",
] as const;

/** Allowed continuity-platform deep imports for C1. */
export const CONTINUITY_C1_ALLOWED_CONTINUITY_IMPORTS = [
  "@/lib/continuity-platform/types",
] as const;

export function findForbiddenBoundaryHits(source: string): string[] {
  const hits: string[] = [];
  for (const pattern of CONTINUITY_C1_FORBIDDEN_IMPORT_PATTERNS) {
    if (source.includes(pattern)) hits.push(pattern);
  }
  return hits;
}
