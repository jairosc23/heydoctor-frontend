"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedRecommendationRankingEngineReadAdapter, type GovernedRecommendationRankingEngineReadAdapter } from "./governed-recommendation-ranking-decision-engine-adapter";
import type { GovernedRecommendationRankingEngineResult } from "./governed-recommendation-ranking-decision-engine";
export type UseGovernedRecommendationRankingEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRecommendationRankingEngineReadAdapter };
export type UseGovernedRecommendationRankingEngineResult = { loading: boolean; error: string | null; result: GovernedRecommendationRankingEngineResult | null; refresh: () => void };
export function useGovernedRecommendationRankingEngine(options: UseGovernedRecommendationRankingEngineOptions): UseGovernedRecommendationRankingEngineResult {
  const { sessionId, enabled = true, adapter = governedRecommendationRankingEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRecommendationRankingEngineResult | null>(null);
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
