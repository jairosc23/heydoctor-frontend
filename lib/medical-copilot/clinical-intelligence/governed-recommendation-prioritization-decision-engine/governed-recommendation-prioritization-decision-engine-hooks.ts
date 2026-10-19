"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedRecommendationPrioritizationEngineReadAdapter, type GovernedRecommendationPrioritizationEngineReadAdapter } from "./governed-recommendation-prioritization-decision-engine-adapter";
import type { GovernedRecommendationPrioritizationEngineResult } from "./governed-recommendation-prioritization-decision-engine";
export type UseGovernedRecommendationPrioritizationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRecommendationPrioritizationEngineReadAdapter };
export type UseGovernedRecommendationPrioritizationEngineResult = { loading: boolean; error: string | null; result: GovernedRecommendationPrioritizationEngineResult | null; refresh: () => void };
export function useGovernedRecommendationPrioritizationEngine(options: UseGovernedRecommendationPrioritizationEngineOptions): UseGovernedRecommendationPrioritizationEngineResult {
  const { sessionId, enabled = true, adapter = governedRecommendationPrioritizationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRecommendationPrioritizationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
