/**
 * EPIC-3 UC-04B — Review & Selection Layer (Close Flow HITL).
 *
 * Physician decisions over EPIC-3 content. For generative items, H1
 * (`POST /ai/runs/:id/approve|reject`) is the source of truth; sessionStorage
 * mirrors decisions after H1 succeeds. Snapshot (no aiRunId) is not_applicable.
 */

import type { InterviewSuggestionsBatch } from "./interview-suggestions";
import type { LiveClinicalInsightsBatch } from "./live-clinical-insights";
import type { PreVisitClinicalSnapshotView } from "./pre-visit-clinical-snapshot";
import type { ClinicalReviewWorkspaceSectionId } from "./clinical-review-workspace";

export type ReviewDecision = "pending" | "accepted" | "edited" | "discarded";

/** H1 Governance outcome for the item's aiRunId (or n/a for non-AI blocks). */
export type ReviewH1Status =
  | "pending"
  | "approved"
  | "rejected"
  | "not_applicable"
  | "failed";

export type ReviewSelectableKind =
  | "interview_question"
  | "clinical_insight"
  | "snapshot_section";

/** Blocks that accept HITL decisions in Close Review. */
export const REVIEW_SELECTABLE_SECTION_IDS = [
  "interview_questions",
  "clinical_insights",
  "clinical_snapshot",
] as const satisfies readonly ClinicalReviewWorkspaceSectionId[];

/** Purely observational Close blocks (no accept/edit/discard). */
export const REVIEW_OBSERVATIONAL_SECTION_IDS = [
  "encounter_context",
  "quality_signals",
  "documentation_quality",
  "clinical_timeline",
] as const satisfies readonly ClinicalReviewWorkspaceSectionId[];

export type ReviewSelectableItem = {
  id: string;
  kind: ReviewSelectableKind;
  sourceUc: "UC-02B" | "UC-03C" | "UC-02C";
  sectionId: (typeof REVIEW_SELECTABLE_SECTION_IDS)[number];
  label: string;
  /** Original text from Prep/Live session content. */
  sourceText: string;
  /** Physician-facing text (edited when decision === edited). */
  displayText: string;
  decision: ReviewDecision;
  /** Preserved for governance/traceability; no new AI run. */
  aiRunId: string | null;
  promptVersion: string | null;
  h1Status: ReviewH1Status;
};

export type ReviewSelectionState = {
  sessionId: string | null;
  items: ReviewSelectableItem[];
  /** Per-aiRunId H1 outcome mirrored from Governance after approve/reject. */
  h1ByAiRunId: Record<string, "approved" | "rejected">;
  updatedAt: string;
  readOnlyEmr: true;
  persistsToEmr: false;
  generatesContent: false;
  runsGovernedPersistence: false;
  signsConsultation: false;
};

export type ReviewSelectionSummary = {
  pending: number;
  accepted: number;
  edited: number;
  discarded: number;
  total: number;
};

export function summarizeReviewSelection(
  state: ReviewSelectionState | null,
): ReviewSelectionSummary {
  const items = state?.items ?? [];
  const counts: ReviewSelectionSummary = {
    pending: 0,
    accepted: 0,
    edited: 0,
    discarded: 0,
    total: items.length,
  };
  for (const item of items) {
    counts[item.decision] += 1;
  }
  return counts;
}

function interviewItems(
  batch: InterviewSuggestionsBatch | null,
): ReviewSelectableItem[] {
  return (batch?.suggestions ?? []).map((s) => ({
    id: `iq:${s.id}`,
    kind: "interview_question" as const,
    sourceUc: "UC-02B" as const,
    sectionId: "interview_questions" as const,
    label: "Suggested Interview Question",
    sourceText: s.text,
    displayText: s.text,
    decision: "pending" as const,
    aiRunId: s.aiRunId ?? batch?.aiRunId ?? null,
    promptVersion: s.promptVersion ?? batch?.promptVersion ?? null,
    h1Status: "pending" as const,
  }));
}

function insightItems(
  batch: LiveClinicalInsightsBatch | null,
): ReviewSelectableItem[] {
  return (batch?.insights ?? [])
    .filter((i) => !i.discarded)
    .map((i) => ({
      id: `ci:${i.id}`,
      kind: "clinical_insight" as const,
      sourceUc: "UC-03C" as const,
      sectionId: "clinical_insights" as const,
      label: "Clinical Insight",
      sourceText: i.text,
      displayText: i.text,
      decision: "pending" as const,
      aiRunId: i.aiRunId ?? batch?.aiRunId ?? null,
      promptVersion: i.promptVersion ?? batch?.promptVersion ?? null,
      h1Status: "pending" as const,
    }));
}

/**
 * Snapshot sections with projected data may be accepted/edited/discarded as
 * session-local review notes. Empty/unavailable sections stay observational.
 */
function snapshotItems(
  snapshot: PreVisitClinicalSnapshotView | null,
): ReviewSelectableItem[] {
  if (!snapshot) return [];
  return snapshot.sections
    .filter((section) => section.availability === "has_data")
    .map((section) => {
      const sourceText = section.lines.map((l) => l.text).join(" · ");
      return {
        id: `snap:${section.id}`,
        kind: "snapshot_section" as const,
        sourceUc: "UC-02C" as const,
        sectionId: "clinical_snapshot" as const,
        label: section.title,
        sourceText,
        displayText: sourceText,
        decision: "pending" as const,
        aiRunId: null,
        promptVersion: null,
        h1Status: "not_applicable" as const,
      };
    });
}

export function collectReviewSelectableItems(input: {
  interviewBatch: InterviewSuggestionsBatch | null;
  insightsBatch: LiveClinicalInsightsBatch | null;
  snapshot: PreVisitClinicalSnapshotView | null;
}): ReviewSelectableItem[] {
  return [
    ...interviewItems(input.interviewBatch),
    ...insightItems(input.insightsBatch),
    ...snapshotItems(input.snapshot),
  ];
}

/**
 * Merge live Prep/Live content into prior Close decisions.
 * Preserves accept/edit/discard for ids still present; drops obsolete ids;
 * adds new source items as pending. Never invents clinical content.
 */
export function mergeReviewSelectionState(input: {
  sessionId: string | null;
  previous: ReviewSelectionState | null;
  interviewBatch: InterviewSuggestionsBatch | null;
  insightsBatch: LiveClinicalInsightsBatch | null;
  snapshot: PreVisitClinicalSnapshotView | null;
  updatedAt?: string;
}): ReviewSelectionState {
  const fresh = collectReviewSelectableItems(input);
  const prevById = new Map(
    (input.previous?.items ?? []).map((item) => [item.id, item]),
  );

  const h1ByAiRunId = { ...(input.previous?.h1ByAiRunId ?? {}) };

  const items = fresh.map((item) => {
    const prev = prevById.get(item.id);
    const runH1 = item.aiRunId ? h1ByAiRunId[item.aiRunId] : undefined;
    const baseH1: ReviewH1Status = item.aiRunId
      ? (runH1 ?? prev?.h1Status ?? "pending")
      : "not_applicable";
    if (!prev) {
      return { ...item, h1Status: baseH1 };
    }
    if (prev.decision === "edited") {
      return {
        ...item,
        decision: "edited" as const,
        displayText: prev.displayText,
        sourceText: item.sourceText,
        aiRunId: item.aiRunId ?? prev.aiRunId,
        promptVersion: item.promptVersion ?? prev.promptVersion,
        h1Status: baseH1,
      };
    }
    if (prev.decision === "accepted" || prev.decision === "discarded") {
      return {
        ...item,
        decision: prev.decision,
        displayText: item.sourceText,
        aiRunId: item.aiRunId ?? prev.aiRunId,
        promptVersion: item.promptVersion ?? prev.promptVersion,
        h1Status: baseH1,
      };
    }
    return {
      ...item,
      decision: "pending" as const,
      displayText: item.sourceText,
      promptVersion: item.promptVersion ?? prev.promptVersion,
      h1Status: baseH1,
    };
  });

  return {
    sessionId: input.sessionId,
    items,
    h1ByAiRunId,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
    readOnlyEmr: true,
    persistsToEmr: false,
    generatesContent: false,
    runsGovernedPersistence: false,
    signsConsultation: false,
  };
}

export function acceptReviewItem(
  state: ReviewSelectionState,
  id: string,
  h1Status: ReviewH1Status = "approved",
): ReviewSelectionState {
  const target = state.items.find((i) => i.id === id);
  const h1ByAiRunId = { ...state.h1ByAiRunId };
  if (target?.aiRunId && (h1Status === "approved" || h1Status === "rejected")) {
    h1ByAiRunId[target.aiRunId] = h1Status;
  }
  return {
    ...state,
    h1ByAiRunId,
    updatedAt: new Date().toISOString(),
    persistsToEmr: false,
    items: state.items.map((item) =>
      item.id === id
        ? {
            ...item,
            decision: "accepted",
            displayText: item.sourceText,
            h1Status: item.aiRunId ? h1Status : "not_applicable",
          }
        : item.aiRunId && target?.aiRunId && item.aiRunId === target.aiRunId
          ? { ...item, h1Status }
          : item,
    ),
  };
}

export function discardReviewItem(
  state: ReviewSelectionState,
  id: string,
  h1Status: ReviewH1Status = "rejected",
): ReviewSelectionState {
  const target = state.items.find((i) => i.id === id);
  const h1ByAiRunId = { ...state.h1ByAiRunId };
  if (target?.aiRunId && h1Status === "rejected") {
    h1ByAiRunId[target.aiRunId] = "rejected";
  }
  return {
    ...state,
    h1ByAiRunId,
    updatedAt: new Date().toISOString(),
    persistsToEmr: false,
    items: state.items.map((item) =>
      item.id === id
        ? {
            ...item,
            decision: "discarded",
            h1Status: item.aiRunId ? h1Status : "not_applicable",
          }
        : item,
    ),
  };
}

export function editReviewItem(
  state: ReviewSelectionState,
  id: string,
  text: string,
  h1Status: ReviewH1Status = "approved",
): ReviewSelectionState {
  const trimmed = text.trim();
  const target = state.items.find((i) => i.id === id);
  const h1ByAiRunId = { ...state.h1ByAiRunId };
  if (
    target?.aiRunId &&
    trimmed &&
    trimmed !== target.sourceText &&
    h1Status === "approved"
  ) {
    h1ByAiRunId[target.aiRunId] = "approved";
  }
  return {
    ...state,
    h1ByAiRunId,
    updatedAt: new Date().toISOString(),
    persistsToEmr: false,
    items: state.items.map((item) => {
      if (item.id !== id) {
        if (
          item.aiRunId &&
          target?.aiRunId &&
          item.aiRunId === target.aiRunId &&
          h1Status === "approved"
        ) {
          return { ...item, h1Status: "approved" };
        }
        return item;
      }
      if (!trimmed || trimmed === item.sourceText) {
        return {
          ...item,
          decision: "pending",
          displayText: item.sourceText,
        };
      }
      return {
        ...item,
        decision: "edited",
        displayText: trimmed,
        h1Status: item.aiRunId ? h1Status : "not_applicable",
      };
    }),
  };
}

/** True when generative item has completed H1 approve before persist. */
export function itemReadyForPersistence(item: ReviewSelectableItem): boolean {
  if (item.decision !== "accepted" && item.decision !== "edited") return false;
  if (!item.aiRunId) return item.h1Status === "not_applicable";
  return item.h1Status === "approved";
}

export function isReviewSectionSelectable(
  sectionId: ClinicalReviewWorkspaceSectionId,
): boolean {
  return (REVIEW_SELECTABLE_SECTION_IDS as readonly string[]).includes(
    sectionId,
  );
}
