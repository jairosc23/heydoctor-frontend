export const GOVERNED_MEDICAL_CERTIFICATE_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedMedicalCertificateDraftGovernance =
  typeof GOVERNED_MEDICAL_CERTIFICATE_DRAFT_GOVERNANCE;

export type GovernedMedicalCertificateDraftSlotKey =
  | "certificate_type_slot"
  | "diagnosis_reference_slot"
  | "justification_slot"
  | "restriction_slot"
  | "validity_period_slot"
  | "observations_slot";

export type GovernedMedicalCertificateDraftItem = {
  slotKey: GovernedMedicalCertificateDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedMedicalCertificateDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  certificateItems: GovernedMedicalCertificateDraftItem[];
  generatedAt: string;
};

/** Composite medical certificate draft envelope — empty structural slots only. */
export type GovernedMedicalCertificateDraftResult = {
  referralDraft: unknown;
  medicalCertificateDraft: GovernedMedicalCertificateDraftView;
  governance: GovernedMedicalCertificateDraftGovernance;
  reason: string | null;
};
