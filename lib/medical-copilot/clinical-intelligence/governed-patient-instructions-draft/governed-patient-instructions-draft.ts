export const GOVERNED_PATIENT_INSTRUCTIONS_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPatientInstructionsDraftGovernance =
  typeof GOVERNED_PATIENT_INSTRUCTIONS_DRAFT_GOVERNANCE;

export type GovernedPatientInstructionsDraftSlotKey =
  | "medication_instructions_slot"
  | "activity_recommendations_slot"
  | "diet_recommendations_slot"
  | "warning_signs_slot"
  | "home_care_slot"
  | "followup_instructions_slot";

export type GovernedPatientInstructionsDraftItem = {
  slotKey: GovernedPatientInstructionsDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedPatientInstructionsDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  patientInstructionItems: GovernedPatientInstructionsDraftItem[];
  generatedAt: string;
};

/** Composite patient instructions draft envelope — empty structural slots only. */
export type GovernedPatientInstructionsDraftResult = {
  medicalLeaveDraft: unknown;
  patientInstructionsDraft: GovernedPatientInstructionsDraftView;
  governance: GovernedPatientInstructionsDraftGovernance;
  reason: string | null;
};
