export const GOVERNED_CONSULTATION_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationPackageGovernance = typeof GOVERNED_CONSULTATION_PACKAGE_GOVERNANCE;

export type GovernedConsultationPackageComponentKey =
  | "encounterConsolidation"
  | "clinicalEncounter"
  | "documentationPackage"
  | "clinicalAssistance"
  | "intelligenceRuntime";

export type GovernedConsultationPackageComponentPresence = {
  key: GovernedConsultationPackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationPackageResult = {
  encounterConsolidation: unknown;
  clinicalEncounter: unknown;
  documentationPackage: unknown;
  clinicalAssistance: unknown;
  intelligenceRuntime: unknown;
  components: GovernedConsultationPackageComponentPresence[];
  governance: GovernedConsultationPackageGovernance;
  reason: string | null;
};
