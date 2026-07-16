"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceRecommendationStrengthEngineReadAdapter, type GovernedEvidenceRecommendationStrengthEngineReadAdapter } from "./governed-evidence-recommendation-strength-engine-adapter";
import type { GovernedEvidenceRecommendationStrengthEngineResult } from "./governed-evidence-recommendation-strength-engine";
export type UseGovernedEvidenceRecommendationStrengthEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceRecommendationStrengthEngineReadAdapter };
export type UseGovernedEvidenceRecommendationStrengthEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceRecommendationStrengthEngineResult | null; refresh: () => void };
export function useGovernedEvidenceRecommendationStrengthEngine(options: UseGovernedEvidenceRecommendationStrengthEngineOptions): UseGovernedEvidenceRecommendationStrengthEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceRecommendationStrengthEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceRecommendationStrengthEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
