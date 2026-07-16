import {
  GOVERNED_CLINICAL_REPOSITORY_WIRING_GOVERNANCE,
  type GovernedClinicalRepositoryWiringComponentKey,
  type GovernedClinicalRepositoryWiringComponentPresence,
  type GovernedClinicalRepositoryWiringResult,
} from "./governed-clinical-repository-wiring";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalRepositoryWiringComponentKey;
  label: string;
}> = [
  { key: "wiring", label: "Repository Wiring" },
  { key: "descriptorRegistry", label: "Descriptor Registry" },
  { key: "dependencyGraph", label: "Dependency Graph" },
  { key: "resolutionContext", label: "Resolution Context" },
  { key: "bindingContracts", label: "Binding Contracts" },
];

export function mapGovernedClinicalRepositoryWiringEnvelope(
  payload: unknown,
): GovernedClinicalRepositoryWiringResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.wiring !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalRepositoryWiringComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }),
  );

  return {
    wiring: data.wiring ?? null,
    descriptorRegistry: data.descriptorRegistry ?? null,
    dependencyGraph: data.dependencyGraph ?? null,
    resolutionContext: data.resolutionContext ?? null,
    bindingContracts: data.bindingContracts ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_REPOSITORY_WIRING_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
