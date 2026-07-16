import {
  GOVERNED_CLINICAL_PERSISTENCE_INFRASTRUCTURE_GOVERNANCE,
  type GovernedClinicalPersistenceInfrastructureComponentKey,
  type GovernedClinicalPersistenceInfrastructureComponentPresence,
  type GovernedClinicalPersistenceInfrastructureResult,
} from "./governed-clinical-persistence-infrastructure";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalPersistenceInfrastructureComponentKey;
  label: string;
}> = [
  { key: "intent", label: "Persistence Intent" },
  { key: "approvalGate", label: "Approval Gate" },
  { key: "policy", label: "Persistence Policy" },
  { key: "auditContract", label: "Audit Contract" },
  { key: "correlation", label: "Correlation" },
  { key: "idempotency", label: "Idempotency" },
  { key: "domainAdapters", label: "Domain Adapter Interfaces" },
  { key: "outcome", label: "Persistence Outcome" },
];

export function mapGovernedClinicalPersistenceInfrastructureEnvelope(
  payload: unknown,
): GovernedClinicalPersistenceInfrastructureResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.intent !== undefined ||
    root.approvalGate !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalPersistenceInfrastructureComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    intent: data.intent ?? null,
    approvalGate: data.approvalGate ?? null,
    policy: data.policy ?? null,
    auditContract: data.auditContract ?? null,
    correlation: data.correlation ?? null,
    idempotency: data.idempotency ?? null,
    domainAdapters: data.domainAdapters ?? null,
    outcome: data.outcome ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_PERSISTENCE_INFRASTRUCTURE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
