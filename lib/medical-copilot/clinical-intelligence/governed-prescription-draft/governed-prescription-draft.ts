export const GOVERNED_PRESCRIPTION_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPrescriptionDraftGovernance =
  typeof GOVERNED_PRESCRIPTION_DRAFT_GOVERNANCE;

export type GovernedPrescriptionDraftSlotKey =
  | "medication_slot"
  | "dosage_slot"
  | "frequency_slot"
  | "duration_slot"
  | "route_slot"
  | "indication_slot";

export type GovernedPrescriptionDraftItem = {
  slotKey: GovernedPrescriptionDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedPrescriptionDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  prescriptionItems: GovernedPrescriptionDraftItem[];
  generatedAt: string;
};

/** Composite prescription draft envelope — empty structural slots only. */
export type GovernedPrescriptionDraftResult = {
  soapDraft: unknown;
  prescriptionDraft: GovernedPrescriptionDraftView;
  governance: GovernedPrescriptionDraftGovernance;
  reason: string | null;
};
