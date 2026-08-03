"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reviewDatasetReadAdapter, type ClinicalReviewDatasetFoundationReadAdapter } from "./clinical-review-dataset-foundation-adapter";
import type { ClinicalReviewDatasetFoundationBuilderResult } from "./clinical-review-dataset-foundation";

export type UseClinicalReviewDatasetFoundationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReviewDatasetFoundationReadAdapter;
};
export type UseClinicalReviewDatasetFoundationResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReviewDatasetFoundationBuilderResult | null;
  refresh: () => void;
};

export function useClinicalReviewDatasetFoundation(options: UseClinicalReviewDatasetFoundationOptions): UseClinicalReviewDatasetFoundationResult {
  const { sessionId, enabled = true, adapter = reviewDatasetReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReviewDatasetFoundationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReviewDatasetFoundation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
