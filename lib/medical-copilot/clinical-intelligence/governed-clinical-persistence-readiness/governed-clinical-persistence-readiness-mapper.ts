import {
  GOVERNED_CLINICAL_PERSISTENCE_READINESS_GOVERNANCE,
  type GovernedClinicalPersistenceReadinessComponentKey,
  type GovernedClinicalPersistenceReadinessComponentPresence,
  type GovernedClinicalPersistenceReadinessResult,
} from "./governed-clinical-persistence-readiness";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalPersistenceReadinessComponentKey;
  label: string;
}> = [
  { key: "evaluation", label: "Final Readiness Evaluation" },
  { key: "capabilitySummary", label: "Final Capability Summary" },
  { key: "blockingConditions", label: "Final Blocking Conditions" },
  { key: "governanceCheck", label: "Final Governance Check" },
];

export function mapGovernedClinicalPersistenceReadinessEnvelope(
  payload: unknown,
): GovernedClinicalPersistenceReadinessResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.readinessRuntime !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const nested =
    data.readinessRuntime && typeof data.readinessRuntime === "object"
      ? (data.readinessRuntime as Record<string, unknown>)
      : {};
  const components: GovernedClinicalPersistenceReadinessComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => ({
      key,
      label,
      present: nested[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }),
  );
  return {
    readinessRuntime: data.readinessRuntime ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_PERSISTENCE_READINESS_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
