"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedWomensHealthReviewEngineReadAdapter, type GovernedWomensHealthReviewEngineReadAdapter } from "./governed-womens-health-review-engine-adapter";
import type { GovernedWomensHealthReviewEngineResult } from "./governed-womens-health-review-engine";
export type UseGovernedWomensHealthReviewEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedWomensHealthReviewEngineReadAdapter };
export type UseGovernedWomensHealthReviewEngineResult = { loading: boolean; error: string | null; result: GovernedWomensHealthReviewEngineResult | null; refresh: () => void };
export function useGovernedWomensHealthReviewEngine(options: UseGovernedWomensHealthReviewEngineOptions): UseGovernedWomensHealthReviewEngineResult {
  const { sessionId, enabled = true, adapter = governedWomensHealthReviewEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedWomensHealthReviewEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedWomensHealthReviewEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
