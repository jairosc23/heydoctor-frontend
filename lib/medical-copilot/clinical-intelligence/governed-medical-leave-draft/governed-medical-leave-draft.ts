export const GOVERNED_MEDICAL_LEAVE_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedMedicalLeaveDraftGovernance =
  typeof GOVERNED_MEDICAL_LEAVE_DRAFT_GOVERNANCE;

export type GovernedMedicalLeaveDraftSlotKey =
  | "leave_type_slot"
  | "diagnosis_reference_slot"
  | "start_date_slot"
  | "end_date_slot"
  | "duration_slot"
  | "work_restrictions_slot";

export type GovernedMedicalLeaveDraftItem = {
  slotKey: GovernedMedicalLeaveDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedMedicalLeaveDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  medicalLeaveItems: GovernedMedicalLeaveDraftItem[];
  generatedAt: string;
};

/** Composite medical leave draft envelope — empty structural slots only. */
export type GovernedMedicalLeaveDraftResult = {
  medicalCertificateDraft: unknown;
  medicalLeaveDraft: GovernedMedicalLeaveDraftView;
  governance: GovernedMedicalLeaveDraftGovernance;
  reason: string | null;
};
