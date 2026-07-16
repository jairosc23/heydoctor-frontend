export const GOVERNED_CLINICAL_DOCUMENTATION_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalDocumentationPackageGovernance =
  typeof GOVERNED_CLINICAL_DOCUMENTATION_PACKAGE_GOVERNANCE;

export type GovernedClinicalDocumentationPackageDocumentKey =
  | "clinicalDraft"
  | "soapDraft"
  | "prescriptionDraft"
  | "ordersDraft"
  | "referralDraft"
  | "medicalCertificateDraft"
  | "medicalLeaveDraft"
  | "patientInstructionsDraft"
  | "followUpDraft"
  | "clinicalVisitSummaryDraft"
  | "carePlanDraft"
  | "patientEducationDraft"
  | "dischargeDraft";

export type GovernedClinicalDocumentationPackageDocumentPresence = {
  key: GovernedClinicalDocumentationPackageDocumentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite documentation package — presence of certified drafts only. */
export type GovernedClinicalDocumentationPackageResult = {
  clinicalDraft: unknown;
  soapDraft: unknown;
  prescriptionDraft: unknown;
  ordersDraft: unknown;
  referralDraft: unknown;
  medicalCertificateDraft: unknown;
  medicalLeaveDraft: unknown;
  patientInstructionsDraft: unknown;
  followUpDraft: unknown;
  clinicalVisitSummaryDraft: unknown;
  carePlanDraft: unknown;
  patientEducationDraft: unknown;
  dischargeDraft: unknown;
  documents: GovernedClinicalDocumentationPackageDocumentPresence[];
  governance: GovernedClinicalDocumentationPackageGovernance;
  reason: string | null;
};
