import {
  GOVERNED_CLINICAL_PERSISTENCE_RUNTIME_STATE_GOVERNANCE,
  type GovernedClinicalPersistenceRuntimeStateComponentKey,
  type GovernedClinicalPersistenceRuntimeStateComponentPresence,
  type GovernedClinicalPersistenceRuntimeStateResult,
} from "./governed-clinical-persistence-runtime-state";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalPersistenceRuntimeStateComponentKey;
  label: string;
}> = [
  { key: "intent", label: "Intent" },
  { key: "transaction", label: "Transaction" },
  { key: "authorization", label: "Authorization" },
  { key: "validation", label: "Validation Pipeline" },
  { key: "lifecycle", label: "Lifecycle" },
  { key: "audit", label: "Audit" },
  { key: "rollback", label: "Rollback" },
  { key: "outcome", label: "Outcome" },
];

export function mapGovernedClinicalPersistenceRuntimeStateEnvelope(
  payload: unknown,
): GovernedClinicalPersistenceRuntimeStateResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.intent !== undefined ||
    root.transaction !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalPersistenceRuntimeStateComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    intent: data.intent ?? null,
    transaction: data.transaction ?? null,
    authorization: data.authorization ?? null,
    validation: data.validation ?? null,
    lifecycle: data.lifecycle ?? null,
    audit: data.audit ?? null,
    rollback: data.rollback ?? null,
    outcome: data.outcome ?? null,
    health: data.health ?? null,
    repositoryRegistry: data.repositoryRegistry ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_PERSISTENCE_RUNTIME_STATE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
