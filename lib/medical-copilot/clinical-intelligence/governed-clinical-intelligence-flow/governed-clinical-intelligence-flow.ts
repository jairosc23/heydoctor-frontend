export const GOVERNED_CLINICAL_INTELLIGENCE_FLOW_VERSION = "1.0.0" as const;

export const GOVERNED_CLINICAL_INTELLIGENCE_FLOW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};

export type GovernedClinicalIntelligenceFlowGovernance =
  typeof GOVERNED_CLINICAL_INTELLIGENCE_FLOW_GOVERNANCE;

export type GovernedClinicalIntelligenceFlowStatus =
  | "draft_ready"
  | "structural_only"
  | "blocked_by_safety"
  | "execution_failed";

export type GovernedClinicalIntelligenceFlowDraftView = {
  status: string;
  assistiveOnlyNotice: string | null;
  possibleDiagnoses: string[];
  recommendations: string[];
  generalEducation: string[];
  summary: string | null;
  suggestedDiagnosis: string[];
  improvedNotes: string | null;
  citations: Array<{ evidenceId: string; label: string; category: string }>;
  model: string | null;
  provider: string | null;
  aiRunId: string | null;
  safetyVerdict: string | null;
  blockReason: string | null;
  llmInvocationStatus: string | null;
};

export type GovernedClinicalIntelligenceFlowPackageRefs = {
  foundationId: string | null;
  clinicalReasoningPackageId: string | null;
  contextId: string | null;
  clinicalPlanId: string | null;
  reviewId: string | null;
  providerExecutionId: string | null;
  normalizedResponseId: string | null;
  clinicalAiOutputId: string | null;
  processedResponseId: string | null;
};

export type GovernedClinicalIntelligenceFlowResult = {
  source: "governed_clinical_intelligence_flow";
  flowVersion: typeof GOVERNED_CLINICAL_INTELLIGENCE_FLOW_VERSION;
  status: GovernedClinicalIntelligenceFlowStatus;
  sessionId: string;
  consultationId: string;
  patientId: string;
  governance: GovernedClinicalIntelligenceFlowGovernance;
  packageRefs: GovernedClinicalIntelligenceFlowPackageRefs;
  draft: GovernedClinicalIntelligenceFlowDraftView | null;
  reason: string | null;
  generatedAt: string;
};
