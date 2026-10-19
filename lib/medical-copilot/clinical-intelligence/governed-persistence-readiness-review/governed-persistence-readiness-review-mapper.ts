import {
  GOVERNED_PERSISTENCE_READINESS_REVIEW_GOVERNANCE,
  type GovernedPersistenceReadinessReviewComponentKey,
  type GovernedPersistenceReadinessReviewComponentPresence,
  type GovernedPersistenceReadinessReviewResult,
} from "./governed-persistence-readiness-review";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessReviewComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessWorkspace", label: "Persistence Readiness Workspace" },
  { key: "clinicalReviewPackage", label: "Clinical Review Package" },
];

export function mapGovernedPersistenceReadinessReviewEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessWorkspace !== undefined ||
    root.clinicalReviewPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessReviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessWorkspace: data.persistenceReadinessWorkspace ?? null,
    clinicalReviewPackage: data.clinicalReviewPackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_REVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
