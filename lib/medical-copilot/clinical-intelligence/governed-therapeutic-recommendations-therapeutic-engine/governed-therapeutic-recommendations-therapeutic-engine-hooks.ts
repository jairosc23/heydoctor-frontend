"use client";
import { useCallback, useEffect, useState } from "react";
import { governedTherapeuticRecommendationsTherapeuticEngineReadAdapter, type GovernedTherapeuticRecommendationsTherapeuticEngineReadAdapter } from "./governed-therapeutic-recommendations-therapeutic-engine-adapter";
import type { GovernedTherapeuticRecommendationsTherapeuticEngineResult } from "./governed-therapeutic-recommendations-therapeutic-engine";
export type UseGovernedTherapeuticRecommendationsTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedTherapeuticRecommendationsTherapeuticEngineReadAdapter };
export type UseGovernedTherapeuticRecommendationsTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedTherapeuticRecommendationsTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedTherapeuticRecommendationsTherapeuticEngine(options: UseGovernedTherapeuticRecommendationsTherapeuticEngineOptions): UseGovernedTherapeuticRecommendationsTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedTherapeuticRecommendationsTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedTherapeuticRecommendationsTherapeuticEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
