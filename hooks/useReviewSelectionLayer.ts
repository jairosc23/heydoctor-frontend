"use client";

/**
 * EPIC-3 UC-04B — Close HITL decisions with H1 Governance as SoT for AI runs.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ensureH1ApproveAiRun,
  ensureH1RejectAiRun,
} from "@/lib/epic3/h1-ai-run-review";
import type { InterviewSuggestionsBatch } from "@/lib/epic3/interview-suggestions";
import type { LiveClinicalInsightsBatch } from "@/lib/epic3/live-clinical-insights";
import type { PreVisitClinicalSnapshotView } from "@/lib/epic3/pre-visit-clinical-snapshot";
import {
  acceptReviewItem,
  discardReviewItem,
  editReviewItem,
  mergeReviewSelectionState,
  summarizeReviewSelection,
  type ReviewSelectionState,
  type ReviewSelectionSummary,
} from "@/lib/epic3/review-selection";
import {
  loadReviewSelectionState,
  saveReviewSelectionState,
} from "@/lib/epic3/review-selection-session";

export function useReviewSelectionLayer(input: {
  open: boolean;
  sessionId: string | null;
  interviewBatch: InterviewSuggestionsBatch | null;
  insightsBatch: LiveClinicalInsightsBatch | null;
  snapshot: PreVisitClinicalSnapshotView | null;
}): {
  state: ReviewSelectionState | null;
  summary: ReviewSelectionSummary;
  busy: boolean;
  error: string | null;
  accept: (id: string) => Promise<void>;
  discard: (id: string) => Promise<void>;
  edit: (id: string, text: string) => Promise<void>;
} {
  const [state, setState] = useState<ReviewSelectionState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.open || !input.sessionId) {
      setState(null);
      return;
    }
    const previous = loadReviewSelectionState(input.sessionId);
    const next = mergeReviewSelectionState({
      sessionId: input.sessionId,
      previous,
      interviewBatch: input.interviewBatch,
      insightsBatch: input.insightsBatch,
      snapshot: input.snapshot,
    });
    setState(next);
    saveReviewSelectionState(next);
  }, [
    input.open,
    input.sessionId,
    input.interviewBatch,
    input.insightsBatch,
    input.snapshot,
  ]);

  const persist = useCallback((next: ReviewSelectionState) => {
    setState(next);
    saveReviewSelectionState(next);
  }, []);

  const accept = useCallback(
    async (id: string) => {
      if (!state) return;
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      setBusy(true);
      setError(null);
      try {
        if (item.aiRunId) {
          const result = await ensureH1ApproveAiRun({
            aiRunId: item.aiRunId,
            alreadyApprovedInSession:
              state.h1ByAiRunId[item.aiRunId] === "approved",
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          persist(acceptReviewItem(state, id, "approved"));
        } else {
          persist(acceptReviewItem(state, id, "not_applicable"));
        }
      } finally {
        setBusy(false);
      }
    },
    [persist, state],
  );

  const discard = useCallback(
    async (id: string) => {
      if (!state) return;
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      setBusy(true);
      setError(null);
      try {
        let next = discardReviewItem(
          state,
          id,
          item.aiRunId ? "pending" : "not_applicable",
        );
        if (item.aiRunId) {
          const siblings = next.items.filter((i) => i.aiRunId === item.aiRunId);
          const allDiscarded = siblings.every((i) => i.decision === "discarded");
          if (allDiscarded) {
            const result = await ensureH1RejectAiRun({
              aiRunId: item.aiRunId,
              alreadyRejectedInSession:
                state.h1ByAiRunId[item.aiRunId] === "rejected",
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            next = discardReviewItem(state, id, "rejected");
            // mark all siblings rejected
            next = {
              ...next,
              items: next.items.map((i) =>
                i.aiRunId === item.aiRunId
                  ? { ...i, h1Status: "rejected" as const }
                  : i,
              ),
            };
          } else if (state.h1ByAiRunId[item.aiRunId] === "approved") {
            next = discardReviewItem(state, id, "approved");
          } else {
            next = discardReviewItem(state, id, "pending");
          }
        }
        persist(next);
      } finally {
        setBusy(false);
      }
    },
    [persist, state],
  );

  const edit = useCallback(
    async (id: string, text: string) => {
      if (!state) return;
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      setBusy(true);
      setError(null);
      try {
        const trimmed = text.trim();
        if (!trimmed || trimmed === item.sourceText) {
          persist(editReviewItem(state, id, text, item.h1Status));
          return;
        }
        if (item.aiRunId) {
          const result = await ensureH1ApproveAiRun({
            aiRunId: item.aiRunId,
            alreadyApprovedInSession:
              state.h1ByAiRunId[item.aiRunId] === "approved",
            overrideReason: "Edición médica en Clinical Review (UC-04B)",
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          persist(editReviewItem(state, id, text, "approved"));
        } else {
          persist(editReviewItem(state, id, text, "not_applicable"));
        }
      } finally {
        setBusy(false);
      }
    },
    [persist, state],
  );

  const summary = useMemo(() => summarizeReviewSelection(state), [state]);

  return {
    state,
    summary,
    busy,
    error,
    accept,
    discard,
    edit,
  };
}
