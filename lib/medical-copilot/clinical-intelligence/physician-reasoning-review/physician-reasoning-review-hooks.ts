"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { physicianReasoningReviewReadAdapter, type PhysicianReasoningReviewReadAdapter } from "./physician-reasoning-review-adapter";
import type { PhysicianReasoningReviewBuilderResult } from "./physician-reasoning-review";
export type UsePhysicianReasoningReviewOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: PhysicianReasoningReviewReadAdapter; };
export type UsePhysicianReasoningReviewResult = { loading: boolean; error: string | null; result: PhysicianReasoningReviewBuilderResult | null; refresh: () => void; };
export function usePhysicianReasoningReview(options: UsePhysicianReasoningReviewOptions): UsePhysicianReasoningReviewResult {
  const { sessionId, enabled = true, adapter = physicianReasoningReviewReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianReasoningReviewBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianReasoningReview(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
