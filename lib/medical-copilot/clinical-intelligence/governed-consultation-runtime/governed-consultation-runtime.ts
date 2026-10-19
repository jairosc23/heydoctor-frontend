export const GOVERNED_CONSULTATION_RUNTIME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationRuntimeGovernance = typeof GOVERNED_CONSULTATION_RUNTIME_GOVERNANCE;

export type GovernedConsultationRuntimeComponentKey =
  | "clinicalEncounter"
  | "physicianWorkspace"
  | "documentationPackage";

export type GovernedConsultationRuntimeComponentPresence = {
  key: GovernedConsultationRuntimeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationRuntimeResult = {
  clinicalEncounter: unknown;
  physicianWorkspace: unknown;
  documentationPackage: unknown;
  components: GovernedConsultationRuntimeComponentPresence[];
  governance: GovernedConsultationRuntimeGovernance;
  reason: string | null;
};
