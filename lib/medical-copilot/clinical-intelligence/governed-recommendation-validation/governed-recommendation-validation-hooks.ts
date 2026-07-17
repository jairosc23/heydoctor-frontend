"use client";
import { useCallback, useEffect, useState } from "react";
import { governedRecommendationValidationReadAdapter, type GovernedRecommendationValidationReadAdapter } from "./governed-recommendation-validation-adapter";
import type { GovernedRecommendationValidationResult } from "./governed-recommendation-validation";

export type UseGovernedRecommendationValidationOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRecommendationValidationReadAdapter };
export type UseGovernedRecommendationValidationResult = { loading: boolean; error: string | null; result: GovernedRecommendationValidationResult | null; refresh: () => void };

export function useGovernedRecommendationValidation(options: UseGovernedRecommendationValidationOptions): UseGovernedRecommendationValidationResult {
  const { sessionId, enabled = true, adapter = governedRecommendationValidationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRecommendationValidationResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedRecommendationValidation(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
