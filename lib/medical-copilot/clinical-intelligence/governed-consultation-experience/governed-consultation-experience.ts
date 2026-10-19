export const GOVERNED_CONSULTATION_EXPERIENCE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationExperienceGovernance = typeof GOVERNED_CONSULTATION_EXPERIENCE_GOVERNANCE;

export type GovernedConsultationExperienceComponentKey =
  | "physicianExperience"
  | "consultationPackage";

export type GovernedConsultationExperienceComponentPresence = {
  key: GovernedConsultationExperienceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationExperienceResult = {
  physicianExperience: unknown;
  consultationPackage: unknown;
  components: GovernedConsultationExperienceComponentPresence[];
  governance: GovernedConsultationExperienceGovernance;
  reason: string | null;
};
