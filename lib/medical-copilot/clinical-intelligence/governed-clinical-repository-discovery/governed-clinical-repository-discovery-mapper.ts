import {
  GOVERNED_CLINICAL_REPOSITORY_DISCOVERY_GOVERNANCE,
  type GovernedClinicalRepositoryDiscoveryComponentKey,
  type GovernedClinicalRepositoryDiscoveryComponentPresence,
  type GovernedClinicalRepositoryDiscoveryResult,
} from "./governed-clinical-repository-discovery";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalRepositoryDiscoveryComponentKey;
  label: string;
}> = [
  { key: "discovery", label: "Repository Discovery" },
  { key: "metadataRegistry", label: "Metadata Registry" },
  { key: "endpointCatalog", label: "Endpoint Catalog" },
  { key: "featureRegistry", label: "Feature Registry" },
];

export function mapGovernedClinicalRepositoryDiscoveryEnvelope(
  payload: unknown,
): GovernedClinicalRepositoryDiscoveryResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.discovery !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalRepositoryDiscoveryComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }),
  );
  return {
    discovery: data.discovery ?? null,
    metadataRegistry: data.metadataRegistry ?? null,
    endpointCatalog: data.endpointCatalog ?? null,
    featureRegistry: data.featureRegistry ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_REPOSITORY_DISCOVERY_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
