/**
 * AI-50 — GovernedClinicalReasoningPackage contracts (frontend).
 */

export const GOVERNED_CLINICAL_REASONING_PACKAGE_VERSION = "1.0.0" as const;

export const GOVERNED_CLINICAL_REASONING_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedClinicalReasoningPackageSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "clinical_reasoning_package_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedClinicalReasoningPackageMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  physicianReasoningPreparationId: string;
  assessmentPackageId: string;
  reviewSessionId: string;
  contextId: string;
  clinicalPlanId: string;
  confidenceId: string;
  evidenceMappingId: string;
  differentialId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_CLINICAL_REASONING_PACKAGE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedClinicalReasoningPackage = {
  clinicalReasoningPackageId: string;
  providerId: AiLayerProviderId;
  packageSlots: GovernedClinicalReasoningPackageSlot[];
  governance: typeof GOVERNED_CLINICAL_REASONING_PACKAGE_GOVERNANCE;
  metadata: GovernedClinicalReasoningPackageMetadata;
};

export type GovernedClinicalReasoningPackageBuilderResult = {
  source: "governed_clinical_reasoning_package";
  builderVersion: typeof GOVERNED_CLINICAL_REASONING_PACKAGE_VERSION;
  clinicalReasoningPackage: GovernedClinicalReasoningPackage;
  governance: typeof GOVERNED_CLINICAL_REASONING_PACKAGE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
