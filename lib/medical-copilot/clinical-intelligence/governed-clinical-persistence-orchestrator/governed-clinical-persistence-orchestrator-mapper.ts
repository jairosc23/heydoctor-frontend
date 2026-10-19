import {
  GOVERNED_CLINICAL_PERSISTENCE_ORCHESTRATOR_GOVERNANCE,
  type GovernedClinicalPersistenceOrchestratorComponentKey,
  type GovernedClinicalPersistenceOrchestratorComponentPresence,
  type GovernedClinicalPersistenceOrchestratorResult,
} from "./governed-clinical-persistence-orchestrator";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalPersistenceOrchestratorComponentKey;
  label: string;
}> = [
  { key: "orchestrator", label: "Persistence Orchestrator" },
  { key: "context", label: "Orchestration Context" },
  { key: "state", label: "Orchestration State" },
  { key: "referencedSurfaces", label: "Referenced Surfaces" },
];

export function mapGovernedClinicalPersistenceOrchestratorEnvelope(
  payload: unknown,
): GovernedClinicalPersistenceOrchestratorResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.orchestrationRuntime !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const nested =
    data.orchestrationRuntime && typeof data.orchestrationRuntime === "object"
      ? (data.orchestrationRuntime as Record<string, unknown>)
      : {};
  const components: GovernedClinicalPersistenceOrchestratorComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => ({
      key,
      label,
      present: nested[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }),
  );
  return {
    orchestrationRuntime: data.orchestrationRuntime ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_PERSISTENCE_ORCHESTRATOR_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
