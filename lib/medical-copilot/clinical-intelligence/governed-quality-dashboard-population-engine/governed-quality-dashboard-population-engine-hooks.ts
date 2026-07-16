"use client";
import { useCallback, useEffect, useState } from "react";
import { governedQualityDashboardPopulationEngineReadAdapter, type GovernedQualityDashboardPopulationEngineReadAdapter } from "./governed-quality-dashboard-population-engine-adapter";
import type { GovernedQualityDashboardPopulationEngineResult } from "./governed-quality-dashboard-population-engine";
export type UseGovernedQualityDashboardPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedQualityDashboardPopulationEngineReadAdapter };
export type UseGovernedQualityDashboardPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedQualityDashboardPopulationEngineResult | null; refresh: () => void };
export function useGovernedQualityDashboardPopulationEngine(options: UseGovernedQualityDashboardPopulationEngineOptions): UseGovernedQualityDashboardPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedQualityDashboardPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedQualityDashboardPopulationEngineResult | null>(null);
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
