/**
 * AI-30 — GovernedClinicalSessionPackage contracts (frontend).
 */

export const GOVERNED_CLINICAL_SESSION_PACKAGE_VERSION = "1.0.0" as const;

export const GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedClinicalSessionPackageSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "session_package_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedClinicalSessionPackageMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  contextId: string;
  clinicalPlanId: string;
  findingRefId: string;
  insightRefId: string;
  recommendationRefId: string;
  reviewId: string;
  caseId: string;
  responseId: string;
  differentialId: string;
  evidenceMappingId: string;
  confidenceId: string;
  missingInformationId: string;
  priorityWorkspaceId: string;
  workspaceId: string;
  evidenceWorkspaceId: string;
  gapAnalyzerId: string;
  reviewWorkspaceV2Id: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_CLINICAL_SESSION_PACKAGE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedClinicalSessionPackage = {
  sessionPackageId: string;
  providerId: AiLayerProviderId;
  packageSlots: GovernedClinicalSessionPackageSlot[];
  governance: typeof GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE;
  metadata: GovernedClinicalSessionPackageMetadata;
};

export type GovernedClinicalSessionPackageBuilderResult = {
  source: "governed_clinical_session_package";
  builderVersion: typeof GOVERNED_CLINICAL_SESSION_PACKAGE_VERSION;
  sessionPackage: GovernedClinicalSessionPackage;
  governance: typeof GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
