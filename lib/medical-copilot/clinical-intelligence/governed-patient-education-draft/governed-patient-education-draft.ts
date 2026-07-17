export const GOVERNED_PATIENT_EDUCATION_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPatientEducationDraftGovernance =
  typeof GOVERNED_PATIENT_EDUCATION_DRAFT_GOVERNANCE;

export type GovernedPatientEducationDraftSlotKey =
  | "diagnosis_education_slot"
  | "medication_education_slot"
  | "lifestyle_education_slot"
  | "warning_signs_education_slot"
  | "prevention_education_slot"
  | "educational_notes_slot";

export type GovernedPatientEducationDraftItem = {
  slotKey: GovernedPatientEducationDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedPatientEducationDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  patientEducationItems: GovernedPatientEducationDraftItem[];
  generatedAt: string;
};

/** Composite patient education draft envelope — empty structural slots only. */
export type GovernedPatientEducationDraftResult = {
  carePlanDraft: unknown;
  patientEducationDraft: GovernedPatientEducationDraftView;
  governance: GovernedPatientEducationDraftGovernance;
  reason: string | null;
};
