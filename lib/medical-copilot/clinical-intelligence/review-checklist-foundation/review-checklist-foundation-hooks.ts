"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { checklistReadAdapter, type ReviewChecklistFoundationReadAdapter } from "./review-checklist-foundation-adapter";
import type { ReviewChecklistFoundationBuilderResult } from "./review-checklist-foundation";

export type UseReviewChecklistFoundationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ReviewChecklistFoundationReadAdapter;
};
export type UseReviewChecklistFoundationResult = {
  loading: boolean;
  error: string | null;
  result: ReviewChecklistFoundationBuilderResult | null;
  refresh: () => void;
};

export function useReviewChecklistFoundation(options: UseReviewChecklistFoundationOptions): UseReviewChecklistFoundationResult {
  const { sessionId, enabled = true, adapter = checklistReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewChecklistFoundationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getReviewChecklistFoundation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
