"use client";
import { useCallback, useEffect, useState } from "react";
import { governedRiskStratificationPopulationEngineReadAdapter, type GovernedRiskStratificationPopulationEngineReadAdapter } from "./governed-risk-stratification-population-engine-adapter";
import type { GovernedRiskStratificationPopulationEngineResult } from "./governed-risk-stratification-population-engine";
export type UseGovernedRiskStratificationPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRiskStratificationPopulationEngineReadAdapter };
export type UseGovernedRiskStratificationPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedRiskStratificationPopulationEngineResult | null; refresh: () => void };
export function useGovernedRiskStratificationPopulationEngine(options: UseGovernedRiskStratificationPopulationEngineOptions): UseGovernedRiskStratificationPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedRiskStratificationPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRiskStratificationPopulationEngineResult | null>(null);
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
