import {
  GOVERNED_CLINICAL_EXECUTION_PACKAGE_GOVERNANCE,
  type GovernedClinicalExecutionPackageComponentKey,
  type GovernedClinicalExecutionPackageComponentPresence,
  type GovernedClinicalExecutionPackageResult,
} from "./governed-clinical-execution-package";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalExecutionPackageComponentKey;
  label: string;
}> = [
  { key: "executionPlanner", label: "Execution Planner" },
  { key: "writePlanner", label: "Write Planner" },
  { key: "rollbackPlanner", label: "Rollback Planner" },
  { key: "transactionPlanner", label: "Transaction Planner" },
  { key: "strategy", label: "Persistence Strategy" },
  { key: "context", label: "Execution Context" },
  { key: "readiness", label: "Execution Readiness" },
  { key: "preview", label: "Execution Preview" },
];

export function mapGovernedClinicalExecutionPackageEnvelope(
  payload: unknown,
): GovernedClinicalExecutionPackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.executionRuntime !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const runtime =
    data.executionRuntime && typeof data.executionRuntime === "object"
      ? (data.executionRuntime as Record<string, unknown>)
      : {};
  const components: GovernedClinicalExecutionPackageComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => ({
      key,
      label,
      present: runtime[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }),
  );

  return {
    executionRuntime: data.executionRuntime ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_EXECUTION_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
