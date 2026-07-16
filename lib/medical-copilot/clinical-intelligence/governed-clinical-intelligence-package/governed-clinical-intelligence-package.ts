/**
 * AI-85 — GovernedClinicalIntelligencePackage contracts (frontend).
 */

export const GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_VERSION = "1.0.0" as const;

export const GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedClinicalIntelligencePackageSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "clinical_intelligence_package_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedClinicalIntelligencePackageMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  physicianReasoningReviewId: string;
  governedReasoningOutputId: string;
  clinicalReasoningPackageId: string;
  assessmentPackageId: string;
  reviewSessionId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedClinicalIntelligencePackage = {
  governedClinicalIntelligencePackageId: string;
  providerId: AiLayerProviderId;
  intelligencePackageSlots: GovernedClinicalIntelligencePackageSlot[];
  governance: typeof GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_GOVERNANCE;
  metadata: GovernedClinicalIntelligencePackageMetadata;
};

export type GovernedClinicalIntelligencePackageBuilderResult = {
  source: "governed_clinical_intelligence_package";
  builderVersion: typeof GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_VERSION;
  governedClinicalIntelligencePackage: GovernedClinicalIntelligencePackage;
  governance: typeof GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
