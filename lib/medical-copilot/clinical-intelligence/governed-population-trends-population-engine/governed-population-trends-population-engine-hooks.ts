"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPopulationTrendsPopulationEngineReadAdapter, type GovernedPopulationTrendsPopulationEngineReadAdapter } from "./governed-population-trends-population-engine-adapter";
import type { GovernedPopulationTrendsPopulationEngineResult } from "./governed-population-trends-population-engine";
export type UseGovernedPopulationTrendsPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPopulationTrendsPopulationEngineReadAdapter };
export type UseGovernedPopulationTrendsPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedPopulationTrendsPopulationEngineResult | null; refresh: () => void };
export function useGovernedPopulationTrendsPopulationEngine(options: UseGovernedPopulationTrendsPopulationEngineOptions): UseGovernedPopulationTrendsPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedPopulationTrendsPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPopulationTrendsPopulationEngineResult | null>(null);
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
