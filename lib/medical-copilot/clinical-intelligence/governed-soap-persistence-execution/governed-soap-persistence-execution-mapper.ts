import { GOVERNED_SOAP_PERSISTENCE_EXECUTION_GOVERNANCE, type GovernedSoapPersistenceExecutionComponentKey, type GovernedSoapPersistenceExecutionComponentPresence, type GovernedSoapPersistenceExecutionResult } from "./governed-soap-persistence-execution";
const COMPONENT_DEFS: Array<{ key: GovernedSoapPersistenceExecutionComponentKey; label: string }> = [
  { key: "validation", label: "Validation" },
  { key: "transaction", label: "Transaction" },
  { key: "repository", label: "Repository" },
  { key: "execution", label: "Execution" },
  { key: "audit", label: "Audit" },
  { key: "rollback", label: "Rollback" },
  { key: "outcome", label: "Outcome" },
];
export function mapGovernedSoapPersistenceExecutionEnvelope(payload: unknown): GovernedSoapPersistenceExecutionResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.runtime !== undefined || root.status !== undefined ? root
    : root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
  if (!data) return null;
  const runtime = data.runtime && typeof data.runtime === "object" ? (data.runtime as Record<string, unknown>) : {};
  const components: GovernedSoapPersistenceExecutionComponentPresence[] = COMPONENT_DEFS.map(({ key, label }) => {
    let present = false;
    if (key === "validation") present = runtime.validation != null || runtime.writeCoordinator != null;
    else if (key === "transaction") present = runtime.transactionCoordinator != null;
    else if (key === "repository") present = runtime.repositoryConnector != null;
    else if (key === "execution") present = runtime.executor != null;
    else if (key === "audit") present = runtime.auditWriter != null;
    else if (key === "rollback") present = runtime.rollbackHandler != null;
    else if (key === "outcome") present = data.status != null || data.outcome != null;
    return { key, label, present, readOnly: true as const, persisted: false as const };
  });
  return {
    runtime: data.runtime ?? null,
    status: typeof data.status === "string" ? data.status : typeof data.outcome === "string" ? data.outcome : null,
    components, governance: { ...GOVERNED_SOAP_PERSISTENCE_EXECUTION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true, persisted: false,
    writesEmr: data.writesEmr === true, writeAttempted: data.writeAttempted === true,
    writeExecuted: data.writeExecuted === true, repositoryInvoked: data.repositoryInvoked === true,
    rollbackExecuted: data.rollbackExecuted === true, entityPersisted: data.entityPersisted === true,
  };
}
