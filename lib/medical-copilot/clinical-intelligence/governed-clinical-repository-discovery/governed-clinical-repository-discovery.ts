export const GOVERNED_CLINICAL_REPOSITORY_DISCOVERY_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalRepositoryDiscoveryGovernance = typeof GOVERNED_CLINICAL_REPOSITORY_DISCOVERY_GOVERNANCE;

export type GovernedClinicalRepositoryDiscoveryComponentKey =
  | "discovery"
  | "metadataRegistry"
  | "endpointCatalog"
  | "featureRegistry";

export type GovernedClinicalRepositoryDiscoveryComponentPresence = {
  key: GovernedClinicalRepositoryDiscoveryComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalRepositoryDiscoveryResult = {
  discovery: unknown;
  metadataRegistry: unknown;
  endpointCatalog: unknown;
  featureRegistry: unknown;
  components: GovernedClinicalRepositoryDiscoveryComponentPresence[];
  governance: GovernedClinicalRepositoryDiscoveryGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
