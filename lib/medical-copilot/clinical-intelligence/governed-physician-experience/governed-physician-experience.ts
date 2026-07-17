export const GOVERNED_PHYSICIAN_EXPERIENCE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianExperienceGovernance = typeof GOVERNED_PHYSICIAN_EXPERIENCE_GOVERNANCE;

export type GovernedPhysicianExperienceComponentKey =
  | "clinicalExperience"
  | "physicianWorkspace";

export type GovernedPhysicianExperienceComponentPresence = {
  key: GovernedPhysicianExperienceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianExperienceResult = {
  clinicalExperience: unknown;
  physicianWorkspace: unknown;
  components: GovernedPhysicianExperienceComponentPresence[];
  governance: GovernedPhysicianExperienceGovernance;
  reason: string | null;
};
