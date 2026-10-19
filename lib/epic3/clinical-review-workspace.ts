/**
 * EPIC-3 UC-04A — Clinical Review Workspace (Close Flow).
 *
 * Visual consolidation only: orchestrates UC-01 … UC-03C surfaces already
 * mounted in the Daily Hub. No EMR writes, no Governed Persistence, no sign,
 * no Consultation mutation, no SOAP/Summary/orders/Rx/referrals.
 */

import type { InterviewSuggestionsBatch } from "./interview-suggestions";
import type { LiveClinicalInsightsBatch } from "./live-clinical-insights";

/** Ordered Close-review surfaces (reuse existing Copilot* components). */
export const CLINICAL_REVIEW_WORKSPACE_SECTIONS = [
  {
    id: "encounter_context",
    label: "Contexto del encounter",
    sourceUc: "UC-01",
    component: "CopilotPreVisitContext",
  },
  {
    id: "clinical_snapshot",
    label: "Snapshot clínico",
    sourceUc: "UC-02C",
    component: "CopilotPreVisitClinicalSnapshot",
  },
  {
    id: "quality_signals",
    label: "Quality Signals",
    sourceUc: "UC-02A",
    component: "CopilotPreVisitQualitySignals",
  },
  {
    id: "interview_questions",
    label: "Suggested Interview Questions (estado final)",
    sourceUc: "UC-02B",
    component: "CopilotSuggestedInterviewQuestions",
  },
  {
    id: "clinical_insights",
    label: "Clinical Insights (aceptados / pendientes)",
    sourceUc: "UC-03C",
    component: "CopilotLiveClinicalInsights",
  },
  {
    id: "documentation_quality",
    label: "Documentation Quality",
    sourceUc: "UC-03B",
    component: "CopilotLiveDocumentationQuality",
  },
  {
    id: "clinical_timeline",
    label: "Timeline clínica",
    sourceUc: "UC-03A",
    component: "CopilotLiveClinicalContextTimeline",
  },
] as const;

export type ClinicalReviewWorkspaceSectionId =
  (typeof CLINICAL_REVIEW_WORKSPACE_SECTIONS)[number]["id"];

export type ClinicalReviewWorkspaceMeta = {
  title: string;
  phase: "close";
  sessionId: string | null;
  sections: typeof CLINICAL_REVIEW_WORKSPACE_SECTIONS;
  interviewFinal: {
    active: number;
    discarded: number;
    total: number;
  };
  insightsReview: {
    pending: number;
    discarded: number;
    total: number;
  };
  readOnlyEmr: true;
  persistsToEmr: false;
  generatesSoap: false;
  generatesSummary: false;
  runsGovernedPersistence: false;
  signsConsultation: false;
};

/**
 * UC-02B discard removes items from the session batch (estado final = remaining).
 */
function countInterviewFinal(batch: InterviewSuggestionsBatch | null) {
  const items = batch?.suggestions ?? [];
  return { active: items.length, discarded: 0, total: items.length };
}

/**
 * Insights still in the session batch are pending physician review.
 * Discard removes them from sessionStorage (same pattern as interview questions).
 * Optional `discarded` flag is honored if present.
 */
function countInsightsReview(batch: LiveClinicalInsightsBatch | null) {
  const items = batch?.insights ?? [];
  const discarded = items.filter((i) => i.discarded).length;
  const pending = items.length - discarded;
  return { pending, discarded, total: items.length };
}

export function buildClinicalReviewWorkspaceMeta(input: {
  sessionId: string | null;
  interviewBatch: InterviewSuggestionsBatch | null;
  insightsBatch: LiveClinicalInsightsBatch | null;
}): ClinicalReviewWorkspaceMeta {
  return {
    title: "Clinical Review Workspace",
    phase: "close",
    sessionId: input.sessionId,
    sections: CLINICAL_REVIEW_WORKSPACE_SECTIONS,
    interviewFinal: countInterviewFinal(input.interviewBatch),
    insightsReview: countInsightsReview(input.insightsBatch),
    readOnlyEmr: true,
    persistsToEmr: false,
    generatesSoap: false,
    generatesSummary: false,
    runsGovernedPersistence: false,
    signsConsultation: false,
  };
}
