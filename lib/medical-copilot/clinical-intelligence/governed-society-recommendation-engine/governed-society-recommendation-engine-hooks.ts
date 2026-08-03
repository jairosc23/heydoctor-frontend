"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedSocietyRecommendationEngineReadAdapter, type GovernedSocietyRecommendationEngineReadAdapter } from "./governed-society-recommendation-engine-adapter";
import type { GovernedSocietyRecommendationEngineResult } from "./governed-society-recommendation-engine";
export type UseGovernedSocietyRecommendationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSocietyRecommendationEngineReadAdapter };
export type UseGovernedSocietyRecommendationEngineResult = { loading: boolean; error: string | null; result: GovernedSocietyRecommendationEngineResult | null; refresh: () => void };
export function useGovernedSocietyRecommendationEngine(options: UseGovernedSocietyRecommendationEngineOptions): UseGovernedSocietyRecommendationEngineResult {
  const { sessionId, enabled = true, adapter = governedSocietyRecommendationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSocietyRecommendationEngineResult | null>(null);
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
