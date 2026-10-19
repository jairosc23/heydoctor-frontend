export const GOVERNED_CLINICAL_ENTITY_MAPPING_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalEntityMappingGovernance = typeof GOVERNED_CLINICAL_ENTITY_MAPPING_GOVERNANCE;

export type GovernedClinicalEntityMappingComponentKey =
  | "consultationMapping"
  | "soapMapping"
  | "prescriptionMapping"
  | "ordersMapping"
  | "referralMapping"
  | "clinicalDocumentsMapping";

export type GovernedClinicalEntityMappingComponentPresence = {
  key: GovernedClinicalEntityMappingComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalEntityMappingResult = {
  mappingRuntime: unknown;
  components: GovernedClinicalEntityMappingComponentPresence[];
  governance: GovernedClinicalEntityMappingGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
