import { heydoctorApi } from "../heydoctor-api";
import type {
  CreateMedicalCopilotSessionData,
  CreateMedicalCopilotSessionPayload,
  MedicalCopilotActionSummary,
  MedicalCopilotApiEnvelope,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "./types";

const BASE = "/medical-copilot";

/**
 * CP-24 Medical Copilot Facade API client.
 * Consumes only `/medical-copilot/*` public endpoints.
 */
export async function createMedicalCopilotSession(
  payload: CreateMedicalCopilotSessionPayload,
): Promise<MedicalCopilotApiEnvelope<CreateMedicalCopilotSessionData>> {
  return heydoctorApi.post(`${BASE}/session`, payload);
}

export async function getMedicalCopilotSession(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ session: MedicalCopilotSessionSummary }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}`);
}

export async function getMedicalCopilotWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ workspace: MedicalCopilotWorkspaceSummary }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/workspace`,
  );
}

export async function getMedicalCopilotTimeline(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ timeline: MedicalCopilotTimelineSummary }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/timeline`,
  );
}

export async function getMedicalCopilotMemory(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ memory: MedicalCopilotMemorySummary }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/memory`,
  );
}

export async function getMedicalCopilotActions(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ actions: MedicalCopilotActionSummary[] }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/actions`,
  );
}

/** CI-1 — Read-only Clinical Intelligence findings consolidation. */
export async function getMedicalCopilotClinicalIntelligence(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ intelligence: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence`,
  );
}

/** CI-2 — Read-only Clinical Insights consolidation over Findings. */
export async function getMedicalCopilotClinicalInsights(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ insights: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-insights`,
  );
}

/** CI-3 — Read-only Clinical Recommendations consolidation over Insights. */
export async function getMedicalCopilotClinicalRecommendations(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ recommendations: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-recommendations`,
  );
}

/** CI-4 — Read-only Clinical Decision Support over Recommendations. */
export async function getMedicalCopilotClinicalDecisionSupport(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ decisions: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-decision-support`,
  );
}

/** CI-5 — Read-only Governed Clinical Reasoning over Decisions. */
export async function getMedicalCopilotGovernedClinicalReasoning(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ reasoning: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-reasoning`,
  );
}

/** CI-6 — Orchestrated Clinical Copilot Snapshot (CI-1…CI-5). */
export async function getMedicalCopilotClinicalCopilotSnapshot(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ snapshot: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-copilot-snapshot`,
  );
}

/** CI-7 — Governed Clinical Review over Snapshot. */
export async function getMedicalCopilotClinicalReview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ review: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-review`,
  );
}

/** CI-8 — Clinical Case Representation over Review. */
export async function getMedicalCopilotClinicalCaseRepresentation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ representation: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-case-representation`,
  );
}

/** CI-9 — Clinical Context over Case Representation. */
export async function getMedicalCopilotClinicalContext(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ context: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-context`,
  );
}

/** CI-10 — Clinical Plan over Clinical Context. */
export async function getMedicalCopilotClinicalPlan(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ plan: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/clinical-plan`,
  );
}

/** AI-1 — Governed AI Request over Clinical Plan. */
export async function getMedicalCopilotGovernedAIRequest(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ request: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-request`,
  );
}

/** AI-2 — AI Provider Route over Governed AI Request. */
export async function getMedicalCopilotAIProviderRoute(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ route: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/ai-provider-route`,
  );
}

/** AI-3 — Governed AI Gateway over Provider Route. */
export async function getMedicalCopilotGovernedAIGateway(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ gateway: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-gateway`,
  );
}

/** AI-4 — OpenAI provider diagnostic via Gateway. */
export async function getMedicalCopilotOpenAIProvider(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ gateway: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/openai-provider`,
  );
}

/** AI-5 — Governed AI Execution Engine diagnostic. */
export async function getMedicalCopilotGovernedAIExecution(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ execution: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-execution`,
  );
}

/** AI-6 — Governed AI Clinical Response diagnostic. */
export async function getMedicalCopilotGovernedAIClinicalResponse(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ clinicalResponse: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-clinical-response`,
  );
}

/** AI-7 — Governed AI Prompt Foundation diagnostic. */
export async function getMedicalCopilotGovernedAIPrompt(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ prompt: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-prompt`,
  );
}

/** AI-8 — Governed Prompt Template Foundation diagnostic. */
export async function getMedicalCopilotGovernedPromptTemplate(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ template: unknown }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-prompt-template`,
  );
}


/** AI-9 — Governed Prompt Composer diagnostic. */
export async function getMedicalCopilotGovernedPromptComposer(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ composedPrompt: unknown }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-prompt-composer`,
  );
}

/** AI-10 — Governed Provider Payload diagnostic. */
export async function getMedicalCopilotGovernedProviderPayload(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ payload: unknown }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-provider-payload`,
  );
}

/** AI-11 — Governed AI Invocation diagnostic. */
export async function getMedicalCopilotGovernedAIInvocation(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ invocation: unknown }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-invocation`,
  );
}

/** AI-12 — Governed AI Response Normalizer diagnostic. */
export async function getMedicalCopilotGovernedAIResponseNormalizer(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ normalized: unknown }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-response-normalizer`,
  );
}

/** AI-13 — Governed Clinical AI Output diagnostic. */
export async function getMedicalCopilotGovernedClinicalAIOutput(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ output: unknown }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-ai-output`,
  );
}

/** AI-14 — Governed Physician Review Prep diagnostic. */
export async function getMedicalCopilotGovernedPhysicianReviewPrep(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ reviewPrep: unknown }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-review-prep`,
  );
}

/** AI-15 — Governed Workflow Integration diagnostic. */
export async function getMedicalCopilotGovernedWorkflowIntegration(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ integration: unknown }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-workflow-integration`,
  );
}


/** AI-16 — Prompt Assembly diagnostic. */
export async function getMedicalCopilotGovernedPromptAssembly(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ assembledPrompt: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-prompt-assembly`);
}
/** AI-17 — Provider Payload Translation diagnostic. */
export async function getMedicalCopilotGovernedProviderPayloadTranslation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ translation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-provider-payload-translation`);
}
/** AI-18 — Provider Execution diagnostic (real OpenAI path). */
export async function getMedicalCopilotGovernedProviderExecution(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ providerExecution: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-provider-execution`);
}
/** AI-19 — AI Response Processing diagnostic. */
export async function getMedicalCopilotGovernedAIResponseProcessing(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ processed: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ai-response-processing`);
}
/** AI-20 — Physician Review Experience diagnostic. */
export async function getMedicalCopilotGovernedPhysicianReviewExperience(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewExperience: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-review-experience`);
}

/** AI-21 — Clinical Differential Foundation diagnostic. */
export async function getMedicalCopilotClinicalDifferentialFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ differential: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-differential-foundation`);
}
/** AI-22 — Evidence Mapping Foundation diagnostic. */
export async function getMedicalCopilotEvidenceMappingFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ evidenceMapping: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/evidence-mapping-foundation`);
}
/** AI-23 — Clinical Confidence Foundation diagnostic. */
export async function getMedicalCopilotClinicalConfidenceFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ confidence: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-confidence-foundation`);
}
/** AI-24 — Missing Information Engine diagnostic. */
export async function getMedicalCopilotMissingInformationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ missingInformation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/missing-information-engine`);
}
/** AI-25 — Physician Decision Workspace diagnostic. */
export async function getMedicalCopilotPhysicianDecisionWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ workspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-decision-workspace`);
}

/** AI-26 — Diagnostic Evidence Workspace diagnostic. */
export async function getMedicalCopilotDiagnosticEvidenceWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ evidenceWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/diagnostic-evidence-workspace`);
}
/** AI-27 — Diagnostic Gap Analyzer diagnostic. */
export async function getMedicalCopilotDiagnosticGapAnalyzer(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ gapAnalyzer: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/diagnostic-gap-analyzer`);
}
/** AI-28 — Clinical Priority Workspace diagnostic. */
export async function getMedicalCopilotClinicalPriorityWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ priorityWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-priority-workspace`);
}
/** AI-29 — Physician Review Workspace v2 diagnostic. */
export async function getMedicalCopilotPhysicianReviewWorkspaceV2(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewWorkspaceV2: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-review-workspace-v2`);
}
/** AI-30 — Governed Clinical Session Package diagnostic. */
export async function getMedicalCopilotGovernedClinicalSessionPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ sessionPackage: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-session-package`);
}

/** AI-31 — Clinical Review Dataset Foundation diagnostic. */
export async function getMedicalCopilotClinicalReviewDatasetFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewDataset: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-review-dataset-foundation`);
}
/** AI-32 — Review Checklist Foundation diagnostic. */
export async function getMedicalCopilotReviewChecklistFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ checklist: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/review-checklist-foundation`);
}
/** AI-33 — Clinical Validation Workspace diagnostic. */
export async function getMedicalCopilotClinicalValidationWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ validationWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-validation-workspace`);
}
/** AI-34 — Physician Review Summary diagnostic. */
export async function getMedicalCopilotPhysicianReviewSummary(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewSummary: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-review-summary`);
}
/** AI-35 — Governed Physician Review Package diagnostic. */
export async function getMedicalCopilotGovernedPhysicianReviewPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ physicianReviewPackage: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-review-package`);
}

/** AI-36 — Physician Review Checklist Workspace diagnostic. */
export async function getMedicalCopilotPhysicianReviewChecklistWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ checklistWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-review-checklist-workspace`);
}
/** AI-37 — Clinical Review Timeline diagnostic. */
export async function getMedicalCopilotClinicalReviewTimeline(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewTimeline: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-review-timeline`);
}
/** AI-38 — Clinical Review Navigation diagnostic. */
export async function getMedicalCopilotClinicalReviewNavigation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewNavigation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-review-navigation`);
}
/** AI-39 — Physician Review Dashboard diagnostic. */
export async function getMedicalCopilotPhysicianReviewDashboard(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewDashboard: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-review-dashboard`);
}
/** AI-40 — Governed Review Session diagnostic. */
export async function getMedicalCopilotGovernedReviewSession(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reviewSession: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-review-session`);
}
/** AI-41 — Clinical Question Generator diagnostic. */
export async function getMedicalCopilotClinicalQuestionGenerator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalQuestions: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-question-generator`);
}
/** AI-42 — Physician Interview Workspace diagnostic. */
export async function getMedicalCopilotPhysicianInterviewWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ interviewWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-interview-workspace`);
}
/** AI-43 — Clinical Completeness Analyzer diagnostic. */
export async function getMedicalCopilotClinicalCompletenessAnalyzer(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ completeness: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-completeness-analyzer`);
}
/** AI-44 — Clinical Readiness Workspace diagnostic. */
export async function getMedicalCopilotClinicalReadinessWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ readinessWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-readiness-workspace`);
}
/** AI-45 — Governed Clinical Assessment Package diagnostic. */
export async function getMedicalCopilotGovernedClinicalAssessmentPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ assessmentPackage: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-assessment-package`);
}
/** AI-46 — Clinical Reasoning Workspace diagnostic. */
export async function getMedicalCopilotClinicalReasoningWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-workspace`);
}
/** AI-47 — Differential Review Workspace diagnostic. */
export async function getMedicalCopilotDifferentialReviewWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ differentialReviewWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/differential-review-workspace`);
}
/** AI-48 — Evidence Completeness Workspace diagnostic. */
export async function getMedicalCopilotEvidenceCompletenessWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ evidenceCompletenessWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/evidence-completeness-workspace`);
}
/** AI-49 — Physician Reasoning Preparation diagnostic. */
export async function getMedicalCopilotPhysicianReasoningPreparation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningPreparation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-reasoning-preparation`);
}
/** AI-50 — Governed Clinical Reasoning Package diagnostic. */
export async function getMedicalCopilotGovernedClinicalReasoningPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningPackage: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-reasoning-package`);
}
/** AI-51 — Clinical Reasoning Dataset diagnostic. */
export async function getMedicalCopilotClinicalReasoningDataset(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningDataset: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-dataset`);
}
/** AI-52 — Evidence Correlation Workspace diagnostic. */
export async function getMedicalCopilotEvidenceCorrelationWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ evidenceCorrelationWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/evidence-correlation-workspace`);
}
/** AI-53 — Clinical Pattern Workspace diagnostic. */
export async function getMedicalCopilotClinicalPatternWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalPatternWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-pattern-workspace`);
}
/** AI-54 — Governed Reasoning Workspace diagnostic. */
export async function getMedicalCopilotGovernedReasoningWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedReasoningWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-reasoning-workspace`);
}
/** AI-55 — Governed Clinical Reasoning Dataset diagnostic. */
export async function getMedicalCopilotGovernedClinicalReasoningDataset(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedClinicalReasoningDataset: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-reasoning-dataset`);
}

/** AI-56 — Clinical Reasoning Context diagnostic. */
export async function getMedicalCopilotClinicalReasoningContext(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningContext: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-context`);
}
/** AI-57 — Evidence Graph Workspace diagnostic. */
export async function getMedicalCopilotEvidenceGraphWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ evidenceGraphWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/evidence-graph-workspace`);
}
/** AI-58 — Clinical Reasoning Inputs diagnostic. */
export async function getMedicalCopilotClinicalReasoningInputs(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningInputs: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-inputs`);
}
/** AI-59 — Governed Reasoning Preparation diagnostic. */
export async function getMedicalCopilotGovernedReasoningPreparation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedReasoningPreparation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-reasoning-preparation`);
}
/** AI-60 — Governed Clinical Reasoning Input Package diagnostic. */
export async function getMedicalCopilotGovernedClinicalReasoningInputPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningInputPackage: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-reasoning-input-package`);
}

/** AI-61 — Clinical Reasoning Engine Core diagnostic. */
export async function getMedicalCopilotClinicalReasoningEngineCore(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningEngineCore: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-engine-core`);
}
/** AI-62 — Reasoning Rule Pipeline diagnostic. */
export async function getMedicalCopilotReasoningRulePipeline(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningRulePipeline: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/reasoning-rule-pipeline`);
}
/** AI-63 — Reasoning Execution Context diagnostic. */
export async function getMedicalCopilotReasoningExecutionContext(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningExecutionContext: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/reasoning-execution-context`);
}
/** AI-64 — Governed Reasoning Runtime diagnostic. */
export async function getMedicalCopilotGovernedReasoningRuntime(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedReasoningRuntime: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-reasoning-runtime`);
}
/** AI-65 — Clinical Reasoning Engine Foundation diagnostic. */
export async function getMedicalCopilotClinicalReasoningEngineFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningEngineFoundation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-engine-foundation`);
}

/** AI-66 — Reasoning Stage Manager diagnostic. */
export async function getMedicalCopilotReasoningStageManager(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningStageManager: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/reasoning-stage-manager`);
}
/** AI-67 — Reasoning State Machine diagnostic. */
export async function getMedicalCopilotReasoningStateMachine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningStateMachine: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/reasoning-state-machine`);
}
/** AI-68 — Reasoning Validation Engine diagnostic. */
export async function getMedicalCopilotReasoningValidationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningValidationEngine: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/reasoning-validation-engine`);
}
/** AI-69 — Governed Reasoning Session diagnostic. */
export async function getMedicalCopilotGovernedReasoningSession(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedReasoningSession: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-reasoning-session`);
}
/** AI-70 — Clinical Reasoning Runtime Foundation diagnostic. */
export async function getMedicalCopilotClinicalReasoningRuntimeFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningRuntimeFoundation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-runtime-foundation`);
}

/** AI-71 — Clinical Reasoning Pipeline diagnostic. */
export async function getMedicalCopilotClinicalReasoningPipeline(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningPipeline: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-pipeline`);
}
/** AI-72 — Clinical Reasoning Graph diagnostic. */
export async function getMedicalCopilotClinicalReasoningGraph(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningGraph: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-graph`);
}
/** AI-73 — Clinical Reasoning Trace diagnostic. */
export async function getMedicalCopilotClinicalReasoningTrace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningTrace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-trace`);
}
/** AI-74 — Governed Clinical Reasoning Session diagnostic. */
export async function getMedicalCopilotGovernedClinicalReasoningSession(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedClinicalReasoningSession: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-reasoning-session`);
}
/** AI-75 — Clinical Reasoning Package diagnostic (runtime output; distinct from AI-50 governed package). */
export async function getMedicalCopilotClinicalReasoningPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningPackage: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-package`);
}

/** AI-76 — ClinicalReasoningOrchestrator diagnostic. */
export async function getMedicalCopilotClinicalReasoningOrchestrator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalReasoningOrchestrator: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-reasoning-orchestrator`);
}
/** AI-77 — DifferentialReasoningEngine diagnostic. */
export async function getMedicalCopilotDifferentialReasoningEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ differentialReasoningEngine: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/differential-reasoning-engine`);
}
/** AI-78 — EvidenceReasoningEngine diagnostic. */
export async function getMedicalCopilotEvidenceReasoningEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ evidenceReasoningEngine: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/evidence-reasoning-engine`);
}
/** AI-79 — ClinicalConsistencyEngine diagnostic. */
export async function getMedicalCopilotClinicalConsistencyEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalConsistencyEngine: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-consistency-engine`);
}
/** AI-80 — GovernedReasoningOutput diagnostic. */
export async function getMedicalCopilotGovernedReasoningOutput(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedReasoningOutput: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-reasoning-output`);
}
/** AI-81 — ClinicalHypothesisWorkspace diagnostic. */
export async function getMedicalCopilotClinicalHypothesisWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalHypothesisWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-hypothesis-workspace`);
}
/** AI-82 — EvidenceRankingWorkspace diagnostic. */
export async function getMedicalCopilotEvidenceRankingWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ evidenceRankingWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/evidence-ranking-workspace`);
}
/** AI-83 — ReasoningQualityEngine diagnostic. */
export async function getMedicalCopilotReasoningQualityEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ reasoningQualityEngine: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/reasoning-quality-engine`);
}
/** AI-84 — PhysicianReasoningReview diagnostic. */
export async function getMedicalCopilotPhysicianReasoningReview(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ physicianReasoningReview: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-reasoning-review`);
}
/** AI-85 — GovernedClinicalIntelligencePackage diagnostic. */
export async function getMedicalCopilotGovernedClinicalIntelligencePackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedClinicalIntelligencePackage: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-package`);
}

/** AI-86 — ClinicalIntelligenceOrchestrator diagnostic. */
export async function getMedicalCopilotClinicalIntelligenceOrchestrator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalIntelligenceOrchestrator: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence-orchestrator`);
}
/** AI-87 — ClinicalIntelligenceContext diagnostic. */
export async function getMedicalCopilotClinicalIntelligenceContext(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalIntelligenceContext: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence-context`);
}
/** AI-88 — ClinicalIntelligenceGraph diagnostic. */
export async function getMedicalCopilotClinicalIntelligenceGraph(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalIntelligenceGraph: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence-graph`);
}
/** AI-89 — ClinicalIntelligenceTrace diagnostic. */
export async function getMedicalCopilotClinicalIntelligenceTrace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalIntelligenceTrace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence-trace`);
}
/** AI-90 — ClinicalIntelligenceRuntime diagnostic. */
export async function getMedicalCopilotClinicalIntelligenceRuntime(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalIntelligenceRuntime: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence-runtime`);
}
/** AI-91 — PhysicianIntelligenceWorkspace diagnostic. */
export async function getMedicalCopilotPhysicianIntelligenceWorkspace(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ physicianIntelligenceWorkspace: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/physician-intelligence-workspace`);
}
/** AI-92 — ClinicalIntelligenceValidation diagnostic. */
export async function getMedicalCopilotClinicalIntelligenceValidation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalIntelligenceValidation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence-validation`);
}
/** AI-93 — GovernedClinicalIntelligenceSession diagnostic. */
export async function getMedicalCopilotGovernedClinicalIntelligenceSession(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedClinicalIntelligenceSession: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-session`);
}
/** AI-94 — ClinicalIntelligenceOutput diagnostic. */
export async function getMedicalCopilotClinicalIntelligenceOutput(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ clinicalIntelligenceOutput: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/clinical-intelligence-output`);
}
/** AI-95 — GovernedClinicalIntelligenceFoundation diagnostic. */
export async function getMedicalCopilotGovernedClinicalIntelligenceFoundation(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governedClinicalIntelligenceFoundation: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-foundation`);
}

/** Phase 2 — Governed Clinical Intelligence Flow (assistive; HITL; never EMR/actions). */
export async function runMedicalCopilotGovernedClinicalIntelligenceFlow(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ flow: unknown }>> {
  return heydoctorApi.post(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-flow`,
    {},
  );
}

/** Phase 2 — Governed Clinical Intelligence Runtime (composed certified packages). */
export async function getMedicalCopilotGovernedClinicalIntelligenceRuntime(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    foundation: unknown;
    providerExecution: unknown;
    processedResponse: unknown;
    clinicalOutput: unknown;
    physicianReview: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-runtime`,
  );
}

/** Phase 3 — Governed Clinical Assistance (visualization session; HITL). */
export async function getMedicalCopilotGovernedClinicalAssistance(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    clinicalContext: unknown;
    clinicalPlan: unknown;
    clinicalOutput: unknown;
    decisionWorkspace: unknown;
    reviewSession: unknown;
    governance: unknown;
    hitl: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-assistance`,
  );
}

/** Phase 4 — Governed Clinical Draft Runtime (structural draft; HITL; never persisted). */
export async function getMedicalCopilotGovernedClinicalDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    assistance: unknown;
    runtime: unknown;
    clinicalOutput: unknown;
    reviewSession: unknown;
    decisionWorkspace: unknown;
    draft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-draft`,
  );
}

/** Phase 5 — Governed SOAP Draft Runtime (structural S/O/A/P; HITL; never persisted). */
export async function getMedicalCopilotGovernedSoapDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalDraft: unknown;
    subjective: unknown;
    objective: unknown;
    assessment: unknown;
    plan: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-soap-draft`,
  );
}

/** Phase 6 — Governed Prescription Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedPrescriptionDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    soapDraft: unknown;
    prescriptionDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-prescription-draft`,
  );
}

/** Phase 7 — Governed Orders Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedOrdersDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    prescriptionDraft: unknown;
    ordersDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-orders-draft`,
  );
}

/** Phase 8 — Governed Referral Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedReferralDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    ordersDraft: unknown;
    referralDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-referral-draft`,
  );
}

/** Phase 9 — Governed Medical Certificate Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedMedicalCertificateDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    referralDraft: unknown;
    medicalCertificateDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-medical-certificate-draft`,
  );
}

/** Phase 10 — Governed Medical Leave Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedMedicalLeaveDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    medicalCertificateDraft: unknown;
    medicalLeaveDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-medical-leave-draft`,
  );
}

/** Phase 11 — Governed Patient Instructions Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedPatientInstructionsDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    medicalLeaveDraft: unknown;
    patientInstructionsDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-patient-instructions-draft`,
  );
}

/** Phase 12 — Governed Follow-up Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedFollowUpDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    patientInstructionsDraft: unknown;
    followUpDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-follow-up-draft`,
  );
}

/** Phase 13 — Governed Clinical Visit Summary Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedClinicalVisitSummaryDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    followUpDraft: unknown;
    clinicalVisitSummaryDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-visit-summary-draft`,
  );
}

/** Phase 14 — Governed Care Plan Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedCarePlanDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalVisitSummaryDraft: unknown;
    carePlanDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-care-plan-draft`,
  );
}

/** Phase 15 — Governed Patient Education Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedPatientEducationDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    carePlanDraft: unknown;
    patientEducationDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-patient-education-draft`,
  );
}

/** Phase 16 — Governed Discharge Draft Runtime (empty structural slots; HITL). */
export async function getMedicalCopilotGovernedDischargeDraft(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    patientEducationDraft: unknown;
    dischargeDraft: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-discharge-draft`,
  );
}

/** Phase 17 — Governed Clinical Documentation Package Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalDocumentationPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
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
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-documentation-package`,
  );
}

/** Phase 18 — Governed Clinical Encounter Runtime (read-only encounter composition; HITL). */
export async function getMedicalCopilotGovernedClinicalEncounter(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    documentationPackage: unknown;
    clinicalAssistance: unknown;
    intelligenceRuntime: unknown;
    clinicalContext: unknown;
    clinicalPlan: unknown;
    clinicalOutput: unknown;
    reviewSession: unknown;
    physicianDecisionWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-encounter`,
  );
}


/** Phase 19 — Physician Workspace Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalEncounter: unknown;
    physicianDecisionWorkspace: unknown;
    reviewSession: unknown;
    clinicalContext: unknown;
    clinicalPlan: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-workspace`,
  );
}

/** Phase 20 — Consultation Runtime Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationRuntime(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalEncounter: unknown;
    physicianWorkspace: unknown;
    documentationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-runtime`,
  );
}

/** Phase 21 — Consultation Snapshot Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationSnapshot(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationRuntime: unknown;
    clinicalContext: unknown;
    clinicalPlan: unknown;
    reviewSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-snapshot`,
  );
}

/** Phase 22 — Consultation Review Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationReview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationSnapshot: unknown;
    physicianWorkspace: unknown;
    documentationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-review`,
  );
}

/** Phase 23 — Consultation Workspace Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationReview: unknown;
    clinicalEncounter: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-workspace`,
  );
}

/** Phase 24 — Encounter Workspace Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedEncounterWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationWorkspace: unknown;
    documentationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-encounter-workspace`,
  );
}

/** Phase 25 — Encounter Review Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedEncounterReview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    encounterWorkspace: unknown;
    reviewSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-encounter-review`,
  );
}

/** Phase 26 — Encounter Snapshot Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedEncounterSnapshot(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    encounterReview: unknown;
    clinicalEncounter: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-encounter-snapshot`,
  );
}

/** Phase 27 — Encounter Consolidation Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedEncounterConsolidation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    encounterSnapshot: unknown;
    documentationPackage: unknown;
    physicianWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-encounter-consolidation`,
  );
}

/** Phase 28 — Consultation Package Gobernado Runtime (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    encounterConsolidation: unknown;
    clinicalEncounter: unknown;
    documentationPackage: unknown;
    clinicalAssistance: unknown;
    intelligenceRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-package`,
  );
}


/** Phase 29 — Clinical Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationPackage: unknown;
    clinicalEncounter: unknown;
    documentationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-workspace`,
  );
}

/** Phase 30 — Clinical Workspace Review Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalWorkspaceReview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalWorkspace: unknown;
    reviewSession: unknown;
    physicianWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-workspace-review`,
  );
}

/** Phase 31 — Clinical Workspace Snapshot Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalWorkspaceSnapshot(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalWorkspaceReview: unknown;
    consultationSnapshot: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-workspace-snapshot`,
  );
}

/** Phase 32 — Clinical Workspace Consolidation Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalWorkspaceConsolidation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalWorkspaceSnapshot: unknown;
    encounterConsolidation: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-workspace-consolidation`,
  );
}

/** Phase 33 — Consultation Dashboard Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationDashboard(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalWorkspaceConsolidation: unknown;
    consultationRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-dashboard`,
  );
}

/** Phase 34 — Physician Dashboard Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianDashboard(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationDashboard: unknown;
    physicianWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-dashboard`,
  );
}

/** Phase 35 — Clinical Dashboard Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalDashboard(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    physicianDashboard: unknown;
    clinicalEncounter: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-dashboard`,
  );
}

/** Phase 36 — Clinical Session Dashboard Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalSessionDashboard(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalDashboard: unknown;
    reviewSession: unknown;
    consultationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-session-dashboard`,
  );
}

/** Phase 37 — Clinical Overview Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalOverview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalSessionDashboard: unknown;
    documentationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-overview`,
  );
}

/** Phase 38 — Clinical Workspace Package Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalWorkspacePackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalOverview: unknown;
    clinicalWorkspace: unknown;
    consultationPackage: unknown;
    documentationPackage: unknown;
    clinicalEncounter: unknown;
    reviewSession: unknown;
    physicianWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-workspace-package`,
  );
}


/** Phase 39 — Clinical Home Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalHome(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalWorkspacePackage: unknown;
    clinicalDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-home`,
  );
}

/** Phase 40 — Physician Home Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianHome(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    physicianDashboard: unknown;
    clinicalHome: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-home`,
  );
}

/** Phase 41 — Consultation Home Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationHome(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationDashboard: unknown;
    physicianHome: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-home`,
  );
}

/** Phase 42 — Clinical Timeline Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalTimeline(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationHome: unknown;
    clinicalOverview: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-timeline`,
  );
}

/** Phase 43 — Encounter Timeline Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedEncounterTimeline(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalTimeline: unknown;
    encounterSnapshot: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-encounter-timeline`,
  );
}

/** Phase 44 — Clinical Navigation Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalNavigation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    encounterTimeline: unknown;
    clinicalWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-navigation`,
  );
}

/** Phase 45 — Clinical Experience Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalExperience(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalNavigation: unknown;
    clinicalSessionDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-experience`,
  );
}

/** Phase 46 — Physician Experience Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianExperience(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalExperience: unknown;
    physicianWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-experience`,
  );
}

/** Phase 47 — Consultation Experience Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationExperience(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    physicianExperience: unknown;
    consultationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-experience`,
  );
}

/** Phase 48 — Clinical Experience Package Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalExperiencePackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationExperience: unknown;
    clinicalWorkspacePackage: unknown;
    consultationPackage: unknown;
    clinicalEncounter: unknown;
    clinicalDashboard: unknown;
    physicianDashboard: unknown;
    reviewSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-experience-package`,
  );
}


/** Phase 49 — Physician Interaction Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianInteractionWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalExperiencePackage: unknown;
    physicianDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-interaction-workspace`,
  );
}

/** Phase 50 — Draft Review Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedDraftReviewWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    documentationPackage: unknown;
    physicianInteractionWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-draft-review-workspace`,
  );
}

/** Phase 51 — Draft Comparison Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedDraftComparisonWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    draftReviewWorkspace: unknown;
    clinicalDocumentationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-draft-comparison-workspace`,
  );
}

/** Phase 52 — Validation Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedValidationWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    draftComparison: unknown;
    reviewSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-validation-workspace`,
  );
}

/** Phase 53 — Approval Preview Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedApprovalPreview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    validationWorkspace: unknown;
    physicianWorkspace: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-approval-preview`,
  );
}

/** Phase 54 — Approval Queue Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedApprovalQueue(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    approvalPreview: unknown;
    consultationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-approval-queue`,
  );
}

/** Phase 55 — Pending Actions Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPendingActions(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    approvalQueue: unknown;
    clinicalWorkspacePackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-pending-actions`,
  );
}

/** Phase 56 — Clinical Review Package Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalReviewPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    pendingActions: unknown;
    reviewSession: unknown;
    consultationExperience: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-review-package`,
  );
}

/** Phase 57 — Physician Session Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianSession(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalReviewPackage: unknown;
    physicianDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-session`,
  );
}

/** Phase 58 — Physician Runtime Package Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianRuntimePackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    physicianSession: unknown;
    clinicalExperiencePackage: unknown;
    clinicalWorkspacePackage: unknown;
    documentationPackage: unknown;
    consultationPackage: unknown;
    reviewSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-runtime-package`,
  );
}


/** Phase 59 — Clinical Activation Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    physicianRuntimePackage: unknown;
    clinicalExperiencePackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-workspace`,
  );
}

/** Phase 60 — Clinical Activation Review Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationReview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    activationWorkspace: unknown;
    clinicalReviewPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-review`,
  );
}

/** Phase 61 — Clinical Activation Timeline Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationTimeline(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    activationReview: unknown;
    clinicalTimeline: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-timeline`,
  );
}

/** Phase 62 — Clinical Activation Navigation Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationNavigation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    activationTimeline: unknown;
    clinicalNavigation: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-navigation`,
  );
}

/** Phase 63 — Physician Activation Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPhysicianActivationWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    activationNavigation: unknown;
    physicianDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-activation-workspace`,
  );
}

/** Phase 64 — Consultation Activation Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedConsultationActivationWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    physicianActivationWorkspace: unknown;
    consultationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-activation-workspace`,
  );
}

/** Phase 65 — Clinical Activation Dashboard Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationDashboard(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    consultationActivationWorkspace: unknown;
    clinicalDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-dashboard`,
  );
}

/** Phase 66 — Clinical Activation Session Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationSession(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    activationDashboard: unknown;
    reviewSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-session`,
  );
}

/** Phase 67 — Clinical Activation Runtime Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationRuntime(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    activationSession: unknown;
    clinicalExperiencePackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-runtime`,
  );
}

/** Phase 68 — Clinical Activation Package Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedClinicalActivationPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalActivationRuntime: unknown;
    physicianRuntimePackage: unknown;
    clinicalExperiencePackage: unknown;
    clinicalWorkspacePackage: unknown;
    consultationPackage: unknown;
    documentationPackage: unknown;
    reviewSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-activation-package`,
  );
}


/** Phase 69 — Persistence Preparation Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistencePreparationWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    clinicalActivationPackage: unknown;
    physicianRuntimePackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-preparation-workspace`,
  );
}

/** Phase 70 — Persistence Review Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistencePreparationWorkspace: unknown;
    clinicalReviewPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-review`,
  );
}

/** Phase 71 — Persistence Timeline Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceTimeline(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReview: unknown;
    clinicalActivationTimeline: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-timeline`,
  );
}

/** Phase 72 — Persistence Navigation Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceNavigation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceTimeline: unknown;
    clinicalActivationNavigation: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-navigation`,
  );
}

/** Phase 73 — Persistence Dashboard Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceDashboard(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceNavigation: unknown;
    clinicalActivationDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-dashboard`,
  );
}

/** Phase 74 — Persistence Session Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceSession(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceDashboard: unknown;
    clinicalActivationSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-session`,
  );
}

/** Phase 75 — Persistence Runtime Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceRuntime(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceSession: unknown;
    clinicalActivationRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-runtime`,
  );
}

/** Phase 76 — Persistence Preview Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistencePreview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceRuntime: unknown;
    clinicalActivationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-preview`,
  );
}

/** Phase 77 — Persistence Validation Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceValidation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistencePreview: unknown;
    physicianRuntimePackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-validation`,
  );
}

/** Phase 78 — Persistence Package Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistencePackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceValidation: unknown;
    clinicalActivationPackage: unknown;
    physicianRuntimePackage: unknown;
    clinicalExperiencePackage: unknown;
    clinicalWorkspacePackage: unknown;
    documentationPackage: unknown;
    consultationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-package`,
  );
}


/** Phase 79 — Persistence Readiness Workspace Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistencePackage: unknown;
    clinicalActivationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-workspace`,
  );
}

/** Phase 80 — Persistence Readiness Review Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessReview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessWorkspace: unknown;
    clinicalReviewPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-review`,
  );
}

/** Phase 81 — Persistence Readiness Timeline Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessTimeline(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessReview: unknown;
    persistenceTimeline: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-timeline`,
  );
}

/** Phase 82 — Persistence Readiness Dashboard Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessDashboard(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessTimeline: unknown;
    persistenceDashboard: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-dashboard`,
  );
}

/** Phase 83 — Persistence Readiness Session Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessSession(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessDashboard: unknown;
    persistenceSession: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-session`,
  );
}

/** Phase 84 — Persistence Readiness Runtime Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessRuntime(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessSession: unknown;
    persistenceRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-runtime`,
  );
}

/** Phase 85 — Persistence Readiness Preview Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessPreview(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessRuntime: unknown;
    persistencePreview: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-preview`,
  );
}

/** Phase 86 — Persistence Readiness Validation Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessValidation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessPreview: unknown;
    persistenceValidation: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-validation`,
  );
}

/** Phase 87 — Persistence Readiness Consolidation Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessConsolidation(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessValidation: unknown;
    clinicalExperiencePackage: unknown;
    clinicalWorkspacePackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-consolidation`,
  );
}

/** Phase 88 — Persistence Readiness Package Gobernado (read-only composition; HITL). */
export async function getMedicalCopilotGovernedPersistenceReadinessPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    persistenceReadinessConsolidation: unknown;
    persistencePackage: unknown;
    clinicalActivationPackage: unknown;
    physicianRuntimePackage: unknown;
    clinicalExperiencePackage: unknown;
    clinicalWorkspacePackage: unknown;
    documentationPackage: unknown;
    consultationPackage: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-readiness-package`,
  );
}


/** Governed Clinical Persistence infrastructure (contracts only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalPersistenceInfrastructure(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    intent: unknown;
    approvalGate: unknown;
    policy: unknown;
    auditContract: unknown;
    correlation: unknown;
    idempotency: unknown;
    domainAdapters: unknown;
    outcome: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-persistence-infrastructure`,
  );
}


/** Governed Clinical Persistence Block 2 runtime state (contracts only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalPersistenceRuntimeState(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    intent: unknown;
    transaction: unknown;
    authorization: unknown;
    validation: unknown;
    lifecycle: unknown;
    audit: unknown;
    rollback: unknown;
    outcome: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-persistence-runtime-state`,
  );
}


/** Governed Clinical Persistence Block 3 repository runtime (adapters only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalRepositoryRuntime(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    resolver: unknown;
    capabilities: unknown;
    readiness: unknown;
    registry: unknown;
    adapters: unknown;
    authorization: unknown;
    validation: unknown;
    health: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-repository-runtime`,
  );
}


/** Governed Clinical Repository Wiring (Block; read-only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalRepositoryWiring(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    wiring: unknown;
    descriptorRegistry: unknown;
    dependencyGraph: unknown;
    resolutionContext: unknown;
    bindingContracts: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-repository-wiring`,
  );
}

/** Governed Clinical Validation Package (Block; read-only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalValidationPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    ownershipValidator: unknown;
    tenantValidator: unknown;
    clinicValidator: unknown;
    sessionValidator: unknown;
    versionValidator: unknown;
    entityValidator: unknown;
    draftValidator: unknown;
    approvalValidator: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-validation-package`,
  );
}

/** Governed Clinical Execution Preparation (Block; read-only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalExecutionPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    executionRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-execution-package`,
  );
}


/** Governed Clinical Repository Discovery (read-only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalRepositoryDiscovery(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    discovery: unknown; metadataRegistry: unknown; endpointCatalog: unknown; featureRegistry: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-repository-discovery`,
  );
}

/** Governed Clinical Entity Mapping (read-only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalMappingPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    mappingRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-mapping-package`,
  );
}

/** Governed Clinical Persistence Orchestrator (read-only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalOrchestrationPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    orchestrationRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-orchestration-package`,
  );
}

/** Governed Clinical Persistence Final Readiness (read-only; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalFinalReadinessPackage(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    readinessRuntime: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-final-readiness-package`,
  );
}


/** Governed Consultation Persistence Bridge (READY_TO_CONNECT; never writes EMR). */
export async function getMedicalCopilotGovernedConsultationPersistenceBridge(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    status: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-persistence-bridge`,
  );
}


/** Governed SOAP Persistence Bridge (READY_TO_CONNECT; never writes EMR). */
export async function getMedicalCopilotGovernedSoapPersistenceBridge(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    status: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-soap-persistence-bridge`,
  );
}

/** Governed Prescription Persistence Bridge (READY_TO_CONNECT; never writes EMR). */
export async function getMedicalCopilotGovernedPrescriptionPersistenceBridge(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    status: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-prescription-persistence-bridge`,
  );
}

/** Governed Orders Persistence Bridge (READY_TO_CONNECT; never writes EMR). */
export async function getMedicalCopilotGovernedOrdersPersistenceBridge(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    status: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-orders-persistence-bridge`,
  );
}

/** Governed Referral Persistence Bridge (READY_TO_CONNECT; never writes EMR). */
export async function getMedicalCopilotGovernedReferralPersistenceBridge(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    status: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-referral-persistence-bridge`,
  );
}

/** Governed Clinical Documents Persistence Bridge (READY_TO_CONNECT; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalDocumentsPersistenceBridge(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    status: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-documents-persistence-bridge`,
  );
}


/** Governed Consultation Persistence Execution evaluate (HITL; never auto-writes). */
export async function getMedicalCopilotGovernedConsultationPersistenceExecution(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{
    runtime: unknown;
    status: unknown;
    governance: unknown;
  }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-persistence-execution`,
  );
}


/** Governed SOAP Persistence Execution evaluate (HITL; never auto-writes). */
export async function getMedicalCopilotGovernedSoapPersistenceExecution(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ runtime: unknown; status: unknown; governance: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-soap-persistence-execution`);
}

/**
 * Execute Governed SOAP Persistence (HITL; existing backend writer).
 * Body requires explicit draftApproved + optimistic expectedVersion.
 */
export async function postMedicalCopilotGovernedSoapPersistenceExecution(
  sessionId: string,
  body: {
    draftApproved: true;
    expectedVersion: string;
    patch: {
      reason?: string;
      notes?: string;
      diagnosis?: string | null;
      treatment?: string | null;
    };
  },
): Promise<
  MedicalCopilotApiEnvelope<{
    writeExecuted?: boolean;
    writeAttempted?: boolean;
    entityPersisted?: boolean;
    rollbackExecuted?: boolean;
    reason?: string;
    persistenceId?: string;
    correlationId?: string;
    auditWriter?: unknown;
    runtime?: unknown;
    status?: unknown;
    governance?: unknown;
  }>
> {
  return heydoctorApi.post(
    `${BASE}/session/${encodeURIComponent(sessionId)}/governed-soap-persistence-execution`,
    body,
  );
}

/** Governed Prescription Persistence Execution evaluate (HITL; never auto-writes). */
export async function getMedicalCopilotGovernedPrescriptionPersistenceExecution(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ runtime: unknown; status: unknown; governance: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-prescription-persistence-execution`);
}

/** Governed Orders Persistence Execution evaluate (HITL; never auto-writes). */
export async function getMedicalCopilotGovernedOrdersPersistenceExecution(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ runtime: unknown; status: unknown; governance: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-orders-persistence-execution`);
}

/** Governed Referral Persistence Execution evaluate (HITL; never auto-writes). */
export async function getMedicalCopilotGovernedReferralPersistenceExecution(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ runtime: unknown; status: unknown; governance: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-referral-persistence-execution`);
}

/** Governed Clinical Documents Persistence Execution evaluate (HITL; never auto-writes). */
export async function getMedicalCopilotGovernedClinicalDocumentsPersistenceExecution(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ runtime: unknown; status: unknown; governance: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-documents-persistence-execution`);
}

/** Governed Clinical Suggestion Runtime (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalSuggestionRuntime(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-suggestion-runtime`);
}

/** Governed Differential Diagnosis Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedDifferentialDiagnosisSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-differential-diagnosis-suggestion`);
}

/** Governed Clinical Assessment Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalAssessmentSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-assessment-suggestion`);
}

/** Governed Treatment Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedTreatmentSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-treatment-suggestion`);
}

/** Governed Medication Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedMedicationSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-medication-suggestion`);
}

/** Governed Orders Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedOrdersSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-orders-suggestion`);
}

/** Governed Referral Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedReferralSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-referral-suggestion`);
}

/** Governed Follow-up Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedFollowUpSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-follow-up-suggestion`);
}

/** Governed Patient Education Suggestion (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedPatientEducationSuggestion(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-patient-education-suggestion`);
}

/** Governed Clinical Recommendation Package (HITL proposal; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalSuggestionPackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-suggestion-package`);
}

/** Governed Clinical Evidence Runtime (HITL decision support; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalEvidenceRuntime(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-evidence-runtime`);
}

/** Governed Evidence Mapping (HITL; never executes). */
export async function getMedicalCopilotGovernedEvidenceMapping(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-mapping`);
}

/** Governed Evidence Trace (HITL; never executes). */
export async function getMedicalCopilotGovernedEvidenceTrace(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-trace`);
}

/** Governed Evidence Confidence (HITL; never executes). */
export async function getMedicalCopilotGovernedEvidenceConfidence(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-confidence`);
}

/** Governed Clinical Explainability (HITL; never executes). */
export async function getMedicalCopilotGovernedClinicalExplainability(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-explainability`);
}

/** Governed Clinical Justification (HITL; never executes). */
export async function getMedicalCopilotGovernedClinicalJustification(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-justification`);
}

/** Governed Physician Decision Support (HITL; never auto-decides). */
export async function getMedicalCopilotGovernedPhysicianDecisionSupport(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-decision-support`);
}

/** Governed Clinical Safety Checks (HITL advisory; never executes). */
export async function getMedicalCopilotGovernedClinicalSafetyChecks(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-safety-checks`);
}

/** Governed Recommendation Validation (HITL; never persists). */
export async function getMedicalCopilotGovernedRecommendationValidation(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-recommendation-validation`);
}

/** Governed Clinical Decision Package (HITL decision support; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalDecisionPackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-decision-package`);
}

/** Governed Drug Interaction Analysis (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedDrugInteractionAnalysis(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-drug-interaction-analysis`);
}


/** Governed Allergy Cross Check (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedAllergyCrossCheck(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-allergy-cross-check`);
}


/** Governed Contraindication Analysis (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedContraindicationAnalysis(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-contraindication-analysis`);
}


/** Governed Clinical Risk Detection (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalRiskDetection(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-risk-detection`);
}


/** Governed Preventive Care Suggestions (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveCareSuggestions(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-care-suggestions`);
}


/** Governed Preventive Screening Suggestions (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveScreeningSuggestions(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-screening-suggestions`);
}


/** Governed Vaccination Review (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedVaccinationReview(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-vaccination-review`);
}


/** Governed Chronic Disease Follow-up Analysis (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedChronicDiseaseFollowUpAnalysis(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-chronic-disease-follow-up-analysis`);
}


/** Governed Clinical Alert Center (HITL clinical intelligence; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalAlertCenter(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-alert-center`);
}

/** Governed Clinical Functional Intelligence Package (HITL; never writes EMR). */
export async function getMedicalCopilotGovernedClinicalFunctionalIntelligencePackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-functional-intelligence-package`);
}

/** Governed Cardiovascular Risk Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedCardiovascularRiskEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-cardiovascular-risk-engine`);
}


/** Governed Diabetes Care Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedDiabetesCareEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diabetes-care-engine`);
}


/** Governed Hypertension Management Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedHypertensionManagementEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-hypertension-management-engine`);
}


/** Governed Renal Risk Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedRenalRiskEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-renal-risk-engine`);
}


/** Governed Polypharmacy Analysis Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedPolypharmacyAnalysisEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-polypharmacy-analysis-engine`);
}


/** Governed Preventive Health Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveHealthEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-health-engine`);
}


/** Governed Geriatric Assessment Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedGeriatricAssessmentEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-geriatric-assessment-engine`);
}


/** Governed Pediatric Safety Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedPediatricSafetyEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-pediatric-safety-engine`);
}


/** Governed Women's Health Review Engine (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedWomensHealthReviewEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-womens-health-review-engine`);
}


/** Governed Specialized Clinical Intelligence Package (HITL specialty engine; never writes EMR). */
export async function getMedicalCopilotGovernedSpecializedClinicalIntelligencePackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-specialized-clinical-intelligence-package`);
}

/** Governed Clinical Rule Engine Runtime (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalRuleEngineRuntime(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-rule-engine-runtime`);
}


/** Governed Drug Interaction Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDrugInteractionRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-drug-interaction-rule-engine`);
}


/** Governed Allergy Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAllergyRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-allergy-rule-engine`);
}


/** Governed Contraindication Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedContraindicationRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-contraindication-rule-engine`);
}


/** Governed Clinical Risk Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalRiskRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-risk-rule-engine`);
}


/** Governed Preventive Care Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveCareRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-care-rule-engine`);
}


/** Governed Vaccination Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedVaccinationRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-vaccination-rule-engine`);
}


/** Governed Chronic Disease Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedChronicDiseaseRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-chronic-disease-rule-engine`);
}


/** Governed Clinical Alert Rule Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalAlertRuleEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-alert-rule-engine`);
}


/** Governed Deterministic Clinical Rules Package (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDeterministicClinicalRulesPackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-deterministic-clinical-rules-package`);
}

/** Governed Clinical Intake Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalIntakeStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intake-stage`);
}


/** Governed Clinical Context Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalContextStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-context-stage`);
}


/** Governed Evidence Aggregation Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceAggregationStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-aggregation-stage`);
}


/** Governed Rules Evaluation Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRulesEvaluationStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-rules-evaluation-stage`);
}


/** Governed Suggestions Aggregation Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSuggestionsAggregationStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-suggestions-aggregation-stage`);
}


/** Governed Decision Support Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDecisionSupportStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-decision-support-stage`);
}


/** Governed Clinical Intelligence Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalIntelligenceStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-stage`);
}


/** Governed Clinical Summary Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalSummaryStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-summary-stage`);
}


/** Governed Physician Review Stage (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPhysicianReviewStage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-review-stage`);
}


/** Governed Clinical Reasoning Pipeline (pipeline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalReasoningPipeline(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-reasoning-pipeline`);
}










/** Disease Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiseaseKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-disease-knowledge-engine`);
}

/** Medication Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMedicationKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-medication-knowledge-engine`);
}

/** Laboratory Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedLaboratoryKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-laboratory-knowledge-engine`);
}

/** Imaging Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedImagingKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-imaging-knowledge-engine`);
}

/** Procedure Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedProcedureKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-procedure-knowledge-engine`);
}

/** Vaccine Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedVaccineKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-vaccine-knowledge-engine`);
}

/** Preventive Medicine Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveMedicineKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-medicine-knowledge-engine`);
}

/** Clinical Guidelines Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalGuidelinesKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-guidelines-knowledge-engine`);
}

/** Diagnostic Criteria Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticCriteriaKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-criteria-knowledge-engine`);
}

/** Differential Diagnosis Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDifferentialDiagnosisKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-differential-diagnosis-knowledge-engine`);
}

/** Drug Monograph Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDrugMonographKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-drug-monograph-knowledge-engine`);
}

/** Drug Interaction Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDrugInteractionKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-drug-interaction-knowledge-engine`);
}

/** Contraindication Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedContraindicationKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-contraindication-knowledge-engine`);
}

/** Allergy Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAllergyKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-allergy-knowledge-engine`);
}

/** Red Flag Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRedFlagKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-red-flag-knowledge-engine`);
}

/** Clinical Scale Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalScaleKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-scale-knowledge-engine`);
}

/** Risk Score Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRiskScoreKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-risk-score-knowledge-engine`);
}

/** Chronic Disease Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedChronicDiseaseKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-chronic-disease-knowledge-engine`);
}

/** Women's Health Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedWomensHealthKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-womens-health-knowledge-engine`);
}

/** Pediatrics Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPediatricsKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-pediatrics-knowledge-engine`);
}

/** Geriatrics Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGeriatricsKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-geriatrics-knowledge-engine`);
}

/** Mental Health Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMentalHealthKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-mental-health-knowledge-engine`);
}

/** Emergency Medicine Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEmergencyMedicineKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-emergency-medicine-knowledge-engine`);
}

/** Public Health Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPublicHealthKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-public-health-knowledge-engine`);
}

/** Preventive Screening Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveScreeningKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-screening-knowledge-engine`);
}

/** Lifestyle Medicine Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedLifestyleMedicineKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-lifestyle-medicine-knowledge-engine`);
}

/** Nutrition Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedNutritionKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-nutrition-knowledge-engine`);
}

/** Follow-up Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedFollowUpKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-follow-up-knowledge-engine`);
}

/** Care Pathway Knowledge Engine (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCarePathwayKnowledgeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-care-pathway-knowledge-engine`);
}

/** Clinical Knowledge Package (deterministic knowledge HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalKnowledgePackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-knowledge-package`);
}


/** Evidence Source Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceSourceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-source-engine`);
}

/** Evidence Hierarchy Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceHierarchyEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-hierarchy-engine`);
}

/** Evidence Level Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceLevelEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-level-engine`);
}

/** Evidence Quality Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceQualityEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-quality-engine`);
}

/** Evidence Confidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceConfidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-confidence-engine`);
}

/** Evidence Recommendation Strength Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceRecommendationStrengthEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-recommendation-strength-engine`);
}

/** Clinical Guideline Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalGuidelineEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-guideline-evidence-engine`);
}

/** Systematic Review Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSystematicReviewEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-systematic-review-evidence-engine`);
}

/** Meta-analysis Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMetaAnalysisEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-meta-analysis-evidence-engine`);
}

/** Randomized Trial Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRandomizedTrialEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-randomized-trial-evidence-engine`);
}

/** Observational Study Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedObservationalStudyEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-observational-study-evidence-engine`);
}

/** Case Series Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCaseSeriesEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-case-series-evidence-engine`);
}

/** Expert Consensus Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedExpertConsensusEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-expert-consensus-evidence-engine`);
}

/** Clinical Protocol Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalProtocolEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-protocol-evidence-engine`);
}

/** Society Recommendation Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSocietyRecommendationEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-society-recommendation-engine`);
}

/** USPSTF Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedUspstfEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-uspstf-evidence-engine`);
}

/** NICE Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedNiceEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-nice-evidence-engine`);
}

/** AHA Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAhaEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-aha-evidence-engine`);
}

/** ESC Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEscEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-esc-evidence-engine`);
}

/** ADA Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAdaEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ada-evidence-engine`);
}

/** KDIGO Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedKdigoEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-kdigo-evidence-engine`);
}

/** GINA Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGinaEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-gina-evidence-engine`);
}

/** GOLD Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGoldEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-gold-evidence-engine`);
}

/** WHO Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedWhoEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-who-evidence-engine`);
}

/** CDC Evidence Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCdcEvidenceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-cdc-evidence-engine`);
}

/** Evidence Traceability Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceTraceabilityEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-traceability-engine`);
}

/** Evidence Versioning Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceVersioningEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-versioning-engine`);
}

/** Evidence Provenance Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceProvenanceEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-provenance-engine`);
}

/** Evidence Consistency Engine (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceConsistencyEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-consistency-engine`);
}

/** Clinical Evidence Package (deterministic evidence HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalEvidenceEnginePackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-evidence-engine-package`);
}


/** Guideline Runtime Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGuidelineRuntimeEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-guideline-runtime-engine`);
}

/** ADA Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAdaGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ada-guideline-engine`);
}

/** AHA Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAhaGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-aha-guideline-engine`);
}

/** ACC Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAccGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-acc-guideline-engine`);
}

/** ESC Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEscGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-esc-guideline-engine`);
}

/** KDIGO Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedKdigoGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-kdigo-guideline-engine`);
}

/** GINA Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGinaGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-gina-guideline-engine`);
}

/** GOLD Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGoldGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-gold-guideline-engine`);
}

/** WHO Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedWhoGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-who-guideline-engine`);
}

/** CDC Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCdcGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-cdc-guideline-engine`);
}

/** USPSTF Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedUspstfGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-uspstf-guideline-engine`);
}

/** NICE Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedNiceGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-nice-guideline-engine`);
}

/** AAP Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAapGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-aap-guideline-engine`);
}

/** ACOG Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAcogGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-acog-guideline-engine`);
}

/** IDSA Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedIdsaGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-idsa-guideline-engine`);
}

/** ASCO Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAscoGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-asco-guideline-engine`);
}

/** Surviving Sepsis Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSurvivingSepsisGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-surviving-sepsis-guideline-engine`);
}

/** Hypertension Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedHypertensionGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-hypertension-guideline-engine`);
}

/** Diabetes Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiabetesGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diabetes-guideline-engine`);
}

/** Heart Failure Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedHeartFailureGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-heart-failure-guideline-engine`);
}

/** COPD Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCopdGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-copd-guideline-engine`);
}

/** Asthma Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAsthmaGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-asthma-guideline-engine`);
}

/** CKD Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCkdGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ckd-guideline-engine`);
}

/** Preventive Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-guideline-engine`);
}

/** Vaccination Guideline Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedVaccinationGuidelineEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-vaccination-guideline-engine`);
}

/** Guideline Version Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGuidelineVersionEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-guideline-version-engine`);
}

/** Guideline Traceability Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGuidelineTraceabilityEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-guideline-traceability-engine`);
}

/** Guideline Conflict Resolution Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGuidelineConflictResolutionEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-guideline-conflict-resolution-engine`);
}

/** Guideline Recommendation Engine (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGuidelineRecommendationEngine(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-guideline-recommendation-engine`);
}

/** Clinical Guidelines Package (deterministic guideline HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalGuidelinesEnginePackage(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-guidelines-engine-package`);
}


/** Clinical Decision Runtime (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalDecisionRuntimeEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-decision-runtime-engine`);
}

/** Differential Diagnosis Ranking Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDifferentialDiagnosisRankingEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-differential-diagnosis-ranking-decision-engine`);
}

/** Differential Prioritization Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDifferentialPrioritizationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-differential-prioritization-decision-engine`);
}

/** Clinical Hypothesis Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalHypothesisEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-hypothesis-decision-engine`);
}

/** Hypothesis Validation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedHypothesisValidationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-hypothesis-validation-decision-engine`);
}

/** Diagnostic Confidence Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticConfidenceEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-confidence-decision-engine`);
}

/** Evidence Correlation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceCorrelationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-correlation-decision-engine`);
}

/** Knowledge Correlation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedKnowledgeCorrelationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-knowledge-correlation-decision-engine`);
}

/** Guideline Correlation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGuidelineCorrelationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-guideline-correlation-decision-engine`);
}

/** Clinical Conflict Detection Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalConflictDetectionEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-conflict-detection-decision-engine`);
}

/** Recommendation Prioritization Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRecommendationPrioritizationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-recommendation-prioritization-decision-engine`);
}

/** Recommendation Ranking Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRecommendationRankingEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-recommendation-ranking-decision-engine`);
}

/** Clinical Recommendation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalRecommendationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-recommendation-decision-engine`);
}

/** Clinical Action Candidate Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalActionCandidateEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-action-candidate-decision-engine`);
}

/** Diagnostic Gap Detection Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticGapDetectionEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-gap-detection-decision-engine`);
}

/** Missing Information Detection Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMissingInformationDetectionEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-missing-information-detection-decision-engine`);
}

/** Missing Laboratory Detection Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMissingLaboratoryDetectionEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-missing-laboratory-detection-decision-engine`);
}

/** Missing Imaging Detection Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMissingImagingDetectionEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-missing-imaging-detection-decision-engine`);
}

/** Missing History Detection Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMissingHistoryDetectionEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-missing-history-detection-decision-engine`);
}

/** Clinical Consistency Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalConsistencyEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-consistency-decision-engine`);
}

/** Clinical Coherence Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalCoherenceEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-coherence-decision-engine`);
}

/** Clinical Explainability Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalExplainabilityEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-explainability-decision-engine`);
}

/** Clinical Transparency Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalTransparencyEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-transparency-decision-engine`);
}

/** Clinical Traceability Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalTraceabilityEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-traceability-decision-engine`);
}

/** Physician Review Preparation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPhysicianReviewPreparationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-physician-review-preparation-decision-engine`);
}

/** Decision Confidence Aggregation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDecisionConfidenceAggregationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-decision-confidence-aggregation-engine`);
}

/** Decision Safety Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDecisionSafetyEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-decision-safety-engine`);
}

/** Decision Quality Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDecisionQualityEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-decision-quality-engine`);
}

/** Decision Governance Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDecisionGovernanceEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-decision-governance-engine`);
}

/** Clinical Decision Package (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalDecisionSystemPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-decision-system-package`);
}


/** Calculation Runtime (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCalculationRuntimeEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-calculation-runtime-engine`);
}

/** BMI (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedBmiCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-bmi-calculation-engine`);
}

/** BSA (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedBsaCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-bsa-calculation-engine`);
}

/** Cockcroft-Gault (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCockcroftGaultCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-cockcroft-gault-calculation-engine`);
}

/** CKD-EPI (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCkdEpiCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ckd-epi-calculation-engine`);
}

/** eGFR (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEgfrCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-egfr-calculation-engine`);
}

/** CHA2DS2-VASc (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCha2ds2VascCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-cha2ds2-vasc-calculation-engine`);
}

/** HAS-BLED (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedHasBledCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-has-bled-calculation-engine`);
}

/** ASCVD (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAscvdCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ascvd-calculation-engine`);
}

/** NEWS2 (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedNews2CalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-news2-calculation-engine`);
}

/** CURB-65 (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCurb65CalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-curb65-calculation-engine`);
}

/** qSOFA (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedQsofaCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-qsofa-calculation-engine`);
}

/** Wells DVT (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedWellsDvtCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-wells-dvt-calculation-engine`);
}

/** Wells PE (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedWellsPeCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-wells-pe-calculation-engine`);
}

/** PERC (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPercCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-perc-calculation-engine`);
}

/** Centor (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCentorCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-centor-calculation-engine`);
}

/** Glasgow (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGlasgowCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-glasgow-calculation-engine`);
}

/** NIHSS (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedNihssCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-nihss-calculation-engine`);
}

/** Child-Pugh (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedChildPughCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-child-pugh-calculation-engine`);
}

/** MELD (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMeldCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-meld-calculation-engine`);
}

/** FIB-4 (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedFib4CalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-fib4-calculation-engine`);
}

/** NAFLD Score (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedNafldScoreCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-nafld-score-calculation-engine`);
}

/** APGAR (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedApgarCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-apgar-calculation-engine`);
}

/** Framingham (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedFraminghamCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-framingham-calculation-engine`);
}

/** TIMI (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTimiCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-timi-calculation-engine`);
}

/** HEART Score (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedHeartScoreCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-heart-score-calculation-engine`);
}

/** Ottawa Ankle Rules (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedOttawaAnkleRulesCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ottawa-ankle-rules-calculation-engine`);
}

/** Ottawa Knee Rules (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedOttawaKneeRulesCalculationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-ottawa-knee-rules-calculation-engine`);
}

/** Calculation Validation Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCalculationValidationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-calculation-validation-engine`);
}

/** Clinical Calculation Package (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalCalculationSystemPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-calculation-system-package`);
}


/** Patient Timeline Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPatientTimelineEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-patient-timeline-engine-longitudinal-engine`);
}

/** Clinical Evolution Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalEvolutionEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-evolution-engine-longitudinal-engine`);
}

/** Disease Progression Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiseaseProgressionEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-disease-progression-engine-longitudinal-engine`);
}

/** Medication Timeline Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMedicationTimelineEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-medication-timeline-engine-longitudinal-engine`);
}

/** Laboratory Trend Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedLaboratoryTrendEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-laboratory-trend-engine-longitudinal-engine`);
}

/** Imaging Trend Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedImagingTrendEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-imaging-trend-engine-longitudinal-engine`);
}

/** Vital Signs Trend Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedVitalSignsTrendEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-vital-signs-trend-engine-longitudinal-engine`);
}

/** Risk Evolution Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRiskEvolutionEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-risk-evolution-engine-longitudinal-engine`);
}

/** Clinical Milestone Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalMilestoneEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-milestone-engine-longitudinal-engine`);
}

/** Chronic Disease Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedChronicDiseaseTimelineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-chronic-disease-timeline-longitudinal-engine`);
}

/** Hospitalization Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedHospitalizationTimelineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-hospitalization-timeline-longitudinal-engine`);
}

/** Procedure Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedProcedureTimelineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-procedure-timeline-longitudinal-engine`);
}

/** Vaccination Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedVaccinationTimelineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-vaccination-timeline-longitudinal-engine`);
}

/** Consultation Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedConsultationTimelineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-consultation-timeline-longitudinal-engine`);
}

/** Care Gap Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCareGapTimelineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-care-gap-timeline-longitudinal-engine`);
}

/** Outcome Tracking (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedOutcomeTrackingLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-outcome-tracking-longitudinal-engine`);
}

/** Clinical Event Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalEventTimelineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-event-timeline-longitudinal-engine`);
}

/** Patient Journey Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPatientJourneyEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-patient-journey-engine-longitudinal-engine`);
}

/** Continuity of Care Engine (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedContinuityOfCareEngineLongitudinalEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-continuity-of-care-engine-longitudinal-engine`);
}

/** Longitudinal Intelligence Package (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalLongitudinalIntelligencePackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-longitudinal-intelligence-package`);
}


/** Medication Optimization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMedicationOptimizationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-medication-optimization-therapeutic-engine`);
}

/** Dose Optimization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDoseOptimizationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-dose-optimization-therapeutic-engine`);
}

/** Therapeutic Escalation (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTherapeuticEscalationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-therapeutic-escalation-therapeutic-engine`);
}

/** Therapeutic De-escalation (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTherapeuticDeEscalationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-therapeutic-de-escalation-therapeutic-engine`);
}

/** Deprescribing (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDeprescribingTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-deprescribing-therapeutic-engine`);
}

/** Medication Reconciliation (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMedicationReconciliationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-medication-reconciliation-therapeutic-engine`);
}

/** Adherence Analysis (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAdherenceAnalysisTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-adherence-analysis-therapeutic-engine`);
}

/** Drug Monitoring (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDrugMonitoringTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-drug-monitoring-therapeutic-engine`);
}

/** Therapeutic Goal Tracking (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTherapeuticGoalTrackingTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-therapeutic-goal-tracking-therapeutic-engine`);
}

/** Side Effect Surveillance (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSideEffectSurveillanceTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-side-effect-surveillance-therapeutic-engine`);
}

/** Drug Safety (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDrugSafetyTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-drug-safety-therapeutic-engine`);
}

/** Polypharmacy Optimization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPolypharmacyOptimizationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-polypharmacy-optimization-therapeutic-engine`);
}

/** Treatment Response (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTreatmentResponseTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-treatment-response-therapeutic-engine`);
}

/** Clinical Monitoring (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalMonitoringTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-monitoring-therapeutic-engine`);
}

/** Follow-up Optimization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedFollowUpOptimizationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-follow-up-optimization-therapeutic-engine`);
}

/** Care Pathway Optimization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCarePathwayOptimizationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-care-pathway-optimization-therapeutic-engine`);
}

/** Therapeutic Recommendations (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTherapeuticRecommendationsTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-therapeutic-recommendations-therapeutic-engine`);
}

/** Treatment Prioritization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTreatmentPrioritizationTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-treatment-prioritization-therapeutic-engine`);
}

/** Clinical Intervention Planning (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalInterventionPlanningTherapeuticEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intervention-planning-therapeutic-engine`);
}

/** Therapeutic Intelligence Package (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTherapeuticIntelligencePackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-therapeutic-intelligence-package`);
}


/** Diagnostic Runtime (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticRuntimeDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-runtime-diagnostic-intel-engine`);
}

/** Differential Evolution (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDifferentialEvolutionDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-differential-evolution-diagnostic-intel-engine`);
}

/** Diagnostic Correlation (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticCorrelationDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-correlation-diagnostic-intel-engine`);
}

/** Diagnostic Pattern Recognition (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticPatternRecognitionDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-pattern-recognition-diagnostic-intel-engine`);
}

/** Syndromic Recognition (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSyndromicRecognitionDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-syndromic-recognition-diagnostic-intel-engine`);
}

/** Clinical Clustering (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalClusteringDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-clustering-diagnostic-intel-engine`);
}

/** Missing Diagnosis Detection (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedMissingDiagnosisDetectionDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-missing-diagnosis-detection-diagnostic-intel-engine`);
}

/** Diagnostic Consistency (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticConsistencyDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-consistency-diagnostic-intel-engine`);
}

/** Diagnostic Prioritization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticPrioritizationDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-prioritization-diagnostic-intel-engine`);
}

/** Diagnostic Confidence (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticConfidenceDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-confidence-diagnostic-intel-engine`);
}

/** Diagnostic Evidence (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticEvidenceDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-evidence-diagnostic-intel-engine`);
}

/** Diagnostic Explainability (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticExplainabilityDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-explainability-diagnostic-intel-engine`);
}

/** Rare Disease Awareness (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRareDiseaseAwarenessDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-rare-disease-awareness-diagnostic-intel-engine`);
}

/** Diagnostic Validation (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticValidationDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-validation-diagnostic-intel-engine`);
}

/** Diagnostic Timeline (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticTimelineDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-timeline-diagnostic-intel-engine`);
}

/** Diagnostic Learning (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticLearningDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-learning-diagnostic-intel-engine`);
}

/** Diagnostic Alerts (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticAlertsDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-alerts-diagnostic-intel-engine`);
}

/** Diagnostic Review (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticReviewDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-review-diagnostic-intel-engine`);
}

/** Diagnostic Governance (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticGovernanceDiagnosticIntelEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-governance-diagnostic-intel-engine`);
}

/** Diagnostic Intelligence Package (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticIntelligencePackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-intelligence-package`);
}


/** Population Runtime (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationRuntimePopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-runtime-population-engine`);
}

/** Risk Stratification (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRiskStratificationPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-risk-stratification-population-engine`);
}

/** Population Screening (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationScreeningPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-screening-population-engine`);
}

/** Preventive Coverage (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveCoveragePopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-coverage-population-engine`);
}

/** Vaccination Coverage (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedVaccinationCoveragePopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-vaccination-coverage-population-engine`);
}

/** Quality Indicators (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedQualityIndicatorsPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-quality-indicators-population-engine`);
}

/** Clinical KPIs (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalKpisPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-kpis-population-engine`);
}

/** Population Trends (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationTrendsPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-trends-population-engine`);
}

/** Clinical Outcomes (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalOutcomesPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-outcomes-population-engine`);
}

/** Resource Utilization (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedResourceUtilizationPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-resource-utilization-population-engine`);
}

/** Disease Burden (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiseaseBurdenPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-disease-burden-population-engine`);
}

/** Readmission Risk (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedReadmissionRiskPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-readmission-risk-population-engine`);
}

/** Preventive Opportunities (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPreventiveOpportunitiesPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-preventive-opportunities-population-engine`);
}

/** Chronic Disease Registry (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedChronicDiseaseRegistryPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-chronic-disease-registry-population-engine`);
}

/** Population Dashboard (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationDashboardPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-dashboard-population-engine`);
}

/** Quality Dashboard (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedQualityDashboardPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-quality-dashboard-population-engine`);
}

/** Clinical Benchmark (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalBenchmarkPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-benchmark-population-engine`);
}

/** Population Explainability (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationExplainabilityPopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-explainability-population-engine`);
}

/** Population Governance (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationGovernancePopulationEngine(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-governance-population-engine`);
}

/** Population Health Package (deterministic HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationHealthPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-health-package`);
}


/** Clinical Orchestrator Runtime (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalOrchestratorRuntime(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-orchestrator-runtime`);
}

/** Clinical Context Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalContextAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-context-aggregator`);
}

/** Clinical Intelligence Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalIntelligenceAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-aggregator`);
}

/** Knowledge Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedKnowledgeAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-knowledge-aggregator`);
}

/** Evidence Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedEvidenceAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-evidence-aggregator`);
}

/** Guideline Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGuidelineAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-guideline-aggregator`);
}

/** Decision Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDecisionAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-decision-aggregator`);
}

/** Calculation Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedCalculationAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-calculation-aggregator`);
}

/** Longitudinal Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedLongitudinalAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-longitudinal-aggregator`);
}

/** Therapeutic Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedTherapeuticAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-therapeutic-aggregator`);
}

/** Diagnostic Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedDiagnosticAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-diagnostic-aggregator`);
}

/** Population Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPopulationAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-population-aggregator`);
}

/** Persistence Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedPersistenceAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-persistence-aggregator`);
}

/** Reasoning Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedReasoningAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-reasoning-aggregator`);
}

/** Suggestion Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSuggestionAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-suggestion-aggregator`);
}

/** Rule Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedRuleAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-rule-aggregator`);
}

/** Safety Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedSafetyAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-safety-aggregator`);
}

/** Governance Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedGovernanceAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-governance-aggregator`);
}

/** Audit Aggregator (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedAuditAggregator(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-audit-aggregator`);
}

/** Clinical AI Orchestrator Package (orchestrator HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalAiOrchestratorPackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-ai-orchestrator-package`);
}

/** Clinical Consultation Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalConsultationWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-consultation-workflow`);
}

/** Clinical Documentation Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalDocumentationWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-documentation-workflow`);
}

/** Clinical Reasoning Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalReasoningWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-reasoning-workflow`);
}

/** Clinical Decision Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalDecisionWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-decision-workflow`);
}

/** Clinical Intelligence Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalIntelligenceWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-intelligence-workflow`);
}

/** Clinical Knowledge Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalKnowledgeWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-knowledge-workflow`);
}

/** Clinical Evidence Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalEvidenceWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-evidence-workflow`);
}

/** Clinical Guidelines Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalGuidelinesWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-guidelines-workflow`);
}

/** Clinical Calculation Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalCalculationWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-calculation-workflow`);
}

/** Clinical Safety Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalSafetyWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-safety-workflow`);
}

/** Clinical Validation Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalValidationWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-validation-workflow`);
}

/** Clinical Physician Review Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalPhysicianReviewWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-physician-review-workflow`);
}

/** Clinical Persistence Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalPersistenceWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-persistence-workflow`);
}

/** Clinical Audit Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalAuditWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-audit-workflow`);
}

/** Clinical Analytics Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalAnalyticsWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-analytics-workflow`);
}

/** Clinical Population Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalPopulationWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-population-workflow`);
}

/** Clinical Marketplace Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalMarketplaceWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-marketplace-workflow`);
}

/** Clinical Dashboard Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalDashboardWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-dashboard-workflow`);
}

/** Clinical Session Workflow (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalSessionWorkflow(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-session-workflow`);
}

/** Enterprise Clinical Workflow Package (workflow engine HITL; never LLM / never writes EMR). */
export async function getMedicalCopilotGovernedClinicalWorkflowEnginePackage(sessionId: string): Promise<MedicalCopilotApiEnvelope<{ governance: unknown; status?: unknown }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}/governed-clinical-workflow-engine-package`);
}

export async function approveMedicalCopilotAction(
  actionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ action: MedicalCopilotActionSummary }>
> {
  return heydoctorApi.post(
    `${BASE}/actions/${encodeURIComponent(actionId)}/approve`,
  );
}

export async function rejectMedicalCopilotAction(
  actionId: string,
  reason?: string,
): Promise<
  MedicalCopilotApiEnvelope<{ action: MedicalCopilotActionSummary }>
> {
  return heydoctorApi.post(
    `${BASE}/actions/${encodeURIComponent(actionId)}/reject`,
    reason ? { reason } : {},
  );
}

/** AR-1 — Server runtime / kill switch status. */
export async function getMedicalCopilotRuntime(): Promise<{
  status: string;
  data: {
    enabled: boolean;
    killSwitch: boolean;
    version: string;
    foundationPersistence?: boolean;
    sseReady?: boolean;
    governance?: {
      requiresPhysicianReview: boolean;
      executesAction: boolean;
      autoPersistedToEmr: boolean;
    };
  };
}> {
  return heydoctorApi.get(`${BASE}/runtime`);
}

/** AR-1 — PHI-safe telemetry ingest. */
export async function postMedicalCopilotTelemetry(payload: {
  event: string;
  detail?: Record<string, unknown>;
  consultationId?: string;
  sessionId?: string;
}): Promise<MedicalCopilotApiEnvelope<{ accepted: boolean; scrubbedKeys: string[] }>> {
  return heydoctorApi.post(`${BASE}/telemetry`, payload);
}

/** AR-1 — PHI-safe clinical experience feedback ingest. */
export async function postMedicalCopilotFeedback(payload: {
  questionnaireVersion?: string;
  incidentCategory?: string;
  cohortTag?: string;
  likert?: Record<string, number | null>;
}): Promise<MedicalCopilotApiEnvelope<{ accepted: true }>> {
  return heydoctorApi.post(`${BASE}/feedback`, payload);
}
