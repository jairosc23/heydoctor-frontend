/**
 * AI-45 — GovernedClinicalAssessmentPackage contracts (frontend).
 */

export const GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_VERSION = "1.0.0" as const;

export const GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedClinicalAssessmentPackageSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "assessment_package_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedClinicalAssessmentPackageMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  reviewSessionId: string;
  interviewWorkspaceId: string;
  clinicalQuestionsId: string;
  completenessId: string;
  readinessWorkspaceId: string;
  confidenceId: string;
  clinicalPlanId: string;
  contextId: string;
  evidenceMappingId: string;
  reviewId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedClinicalAssessmentPackage = {
  assessmentPackageId: string;
  providerId: AiLayerProviderId;
  packageSlots: GovernedClinicalAssessmentPackageSlot[];
  governance: typeof GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE;
  metadata: GovernedClinicalAssessmentPackageMetadata;
};

export type GovernedClinicalAssessmentPackageBuilderResult = {
  source: "governed_clinical_assessment_package";
  builderVersion: typeof GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_VERSION;
  assessmentPackage: GovernedClinicalAssessmentPackage;
  governance: typeof GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
