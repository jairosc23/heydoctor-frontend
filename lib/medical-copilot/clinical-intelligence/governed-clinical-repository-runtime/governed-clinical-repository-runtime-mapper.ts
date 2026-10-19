import {
  GOVERNED_CLINICAL_REPOSITORY_RUNTIME_GOVERNANCE,
  type GovernedClinicalRepositoryRuntimeComponentKey,
  type GovernedClinicalRepositoryRuntimeComponentPresence,
  type GovernedClinicalRepositoryRuntimeResult,
} from "./governed-clinical-repository-runtime";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalRepositoryRuntimeComponentKey;
  label: string;
}> = [
  { key: "resolver", label: "Repository Resolver" },
  { key: "capabilities", label: "Capability Matrix" },
  { key: "readiness", label: "Adapter Readiness" },
  { key: "registry", label: "Repository Registry" },
  { key: "adapters", label: "Adapter Interfaces" },
  { key: "authorization", label: "Authorization" },
  { key: "validation", label: "Validation" },
  { key: "health", label: "Health" },
];

export function mapGovernedClinicalRepositoryRuntimeEnvelope(
  payload: unknown,
): GovernedClinicalRepositoryRuntimeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.resolver !== undefined ||
    root.capabilities !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalRepositoryRuntimeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    resolver: data.resolver ?? null,
    capabilities: data.capabilities ?? null,
    readiness: data.readiness ?? null,
    registry: data.registry ?? null,
    adapters: data.adapters ?? null,
    authorization: data.authorization ?? null,
    validation: data.validation ?? null,
    health: data.health ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_REPOSITORY_RUNTIME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
