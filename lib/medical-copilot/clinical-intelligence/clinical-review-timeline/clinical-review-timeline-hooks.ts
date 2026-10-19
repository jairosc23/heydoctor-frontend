"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reviewTimelineReadAdapter, type ClinicalReviewTimelineReadAdapter } from "./clinical-review-timeline-adapter";
import type { ClinicalReviewTimelineBuilderResult } from "./clinical-review-timeline";

export type UseClinicalReviewTimelineOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReviewTimelineReadAdapter;
};
export type UseClinicalReviewTimelineResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReviewTimelineBuilderResult | null;
  refresh: () => void;
};

export function useClinicalReviewTimeline(options: UseClinicalReviewTimelineOptions): UseClinicalReviewTimelineResult {
  const { sessionId, enabled = true, adapter = reviewTimelineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReviewTimelineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReviewTimeline(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
