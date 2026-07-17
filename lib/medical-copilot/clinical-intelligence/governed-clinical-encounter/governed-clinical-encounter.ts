export const GOVERNED_CLINICAL_ENCOUNTER_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalEncounterGovernance =
  typeof GOVERNED_CLINICAL_ENCOUNTER_GOVERNANCE;

export type GovernedClinicalEncounterComponentKey =
  | "documentationPackage"
  | "clinicalAssistance"
  | "intelligenceRuntime"
  | "clinicalContext"
  | "clinicalPlan"
  | "clinicalOutput"
  | "reviewSession"
  | "physicianDecisionWorkspace";

export type GovernedClinicalEncounterComponentPresence = {
  key: GovernedClinicalEncounterComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite clinical encounter — presence of certified surfaces only. */
export type GovernedClinicalEncounterResult = {
  documentationPackage: unknown;
  clinicalAssistance: unknown;
  intelligenceRuntime: unknown;
  clinicalContext: unknown;
  clinicalPlan: unknown;
  clinicalOutput: unknown;
  reviewSession: unknown;
  physicianDecisionWorkspace: unknown;
  components: GovernedClinicalEncounterComponentPresence[];
  governance: GovernedClinicalEncounterGovernance;
  reason: string | null;
};
