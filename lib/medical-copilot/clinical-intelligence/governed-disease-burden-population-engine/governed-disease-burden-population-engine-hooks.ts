"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiseaseBurdenPopulationEngineReadAdapter, type GovernedDiseaseBurdenPopulationEngineReadAdapter } from "./governed-disease-burden-population-engine-adapter";
import type { GovernedDiseaseBurdenPopulationEngineResult } from "./governed-disease-burden-population-engine";
export type UseGovernedDiseaseBurdenPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiseaseBurdenPopulationEngineReadAdapter };
export type UseGovernedDiseaseBurdenPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedDiseaseBurdenPopulationEngineResult | null; refresh: () => void };
export function useGovernedDiseaseBurdenPopulationEngine(options: UseGovernedDiseaseBurdenPopulationEngineOptions): UseGovernedDiseaseBurdenPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedDiseaseBurdenPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiseaseBurdenPopulationEngineResult | null>(null);
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
