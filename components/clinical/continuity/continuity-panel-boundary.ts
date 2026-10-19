/**
 * PR-10/PR-11 — Continuity Panel import boundary.
 * C1 files: types-only from continuity-platform.
 * C2 handoff files: may use adapter/assert/policy + applyContinuityHydrationDraft.
 * All files: no clinical writes / confirmAndEmit / Renew.
 */

export const CONTINUITY_PANEL_DIR = "components/clinical/continuity";

/** C2 files allowed to import adapter/assert/policy + Composer apply entry. */
export const CONTINUITY_C2_HANDOFF_FILES = [
  "continuity-hydration-handoff.ts",
  "ContinuityHintCta.tsx",
  "ContinuityPanelShell.tsx",
  "ContinuityHintsSection.tsx",
] as const;

/** Forbidden on every continuity panel file (C1 + C2). */
export const CONTINUITY_ALWAYS_FORBIDDEN = [
  "confirmAndEmit",
  "createPrescription",
  "@/lib/services/prescriptions",
  "lib/services/prescriptions",
  "renewPrescription",
  "POST /prescriptions",
  "hydrateFromAssistDraft",
  "@/lib/continuity-platform\"",
  "@/lib/continuity-platform'",
  "@/lib/continuity-platform`",
  "continuity-platform/index",
] as const;

/** Extra bans for non-handoff (C1-only) sources. */
export const CONTINUITY_C1_EXTRA_FORBIDDEN = [
  "@/lib/composer-intake",
  "lib/composer-intake",
  "ClinicalAssistPrefillDraft",
  "continuity-platform/adapter",
  "continuity-platform/assert-hydration-draft",
  "continuity-platform/hydration-policy",
  "toClinicalAssistPrefillDraft",
  "assertContinuityHydrationDraft",
  "resolveContinuityHydrationGate",
  "applyContinuityHydrationDraft",
  "runContinuityHydrationHandoff",
] as const;

export function isContinuityC2HandoffFile(filename: string): boolean {
  return (CONTINUITY_C2_HANDOFF_FILES as readonly string[]).some((f) =>
    filename.endsWith(f),
  );
}

export function findForbiddenBoundaryHits(
  source: string,
  filename: string,
): string[] {
  const hits: string[] = [];
  for (const pattern of CONTINUITY_ALWAYS_FORBIDDEN) {
    if (source.includes(pattern)) hits.push(pattern);
  }
  if (!isContinuityC2HandoffFile(filename)) {
    for (const pattern of CONTINUITY_C1_EXTRA_FORBIDDEN) {
      if (source.includes(pattern)) hits.push(pattern);
    }
  } else {
    // C2 handoff may import apply-continuity-hydration deep path only
    if (
      source.includes("@/lib/composer-intake\"") ||
      source.includes("@/lib/composer-intake'") ||
      source.includes("from \"@/lib/composer-intake\"") ||
      source.includes("from '@/lib/composer-intake'")
    ) {
      hits.push("composer-intake-barrel");
    }
  }
  return hits;
}
