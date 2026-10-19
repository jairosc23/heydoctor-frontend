import {
  GOVERNED_PERSISTENCE_REVIEW_GOVERNANCE,
  type GovernedPersistenceReviewComponentKey,
  type GovernedPersistenceReviewComponentPresence,
  type GovernedPersistenceReviewResult,
} from "./governed-persistence-review";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReviewComponentKey;
  label: string;
}> = [
  { key: "persistencePreparationWorkspace", label: "Persistence Preparation Workspace" },
  { key: "clinicalReviewPackage", label: "Clinical Review Package" },
];

export function mapGovernedPersistenceReviewEnvelope(
  payload: unknown,
): GovernedPersistenceReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistencePreparationWorkspace !== undefined ||
    root.clinicalReviewPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistencePreparationWorkspace: data.persistencePreparationWorkspace ?? null,
    clinicalReviewPackage: data.clinicalReviewPackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_REVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
