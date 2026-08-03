"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalRecommendationEngineReadAdapter, type GovernedClinicalRecommendationEngineReadAdapter } from "./governed-clinical-recommendation-decision-engine-adapter";
import type { GovernedClinicalRecommendationEngineResult } from "./governed-clinical-recommendation-decision-engine";
export type UseGovernedClinicalRecommendationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalRecommendationEngineReadAdapter };
export type UseGovernedClinicalRecommendationEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalRecommendationEngineResult | null; refresh: () => void };
export function useGovernedClinicalRecommendationEngine(options: UseGovernedClinicalRecommendationEngineOptions): UseGovernedClinicalRecommendationEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalRecommendationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalRecommendationEngineResult | null>(null);
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
