"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPopulationDashboardPopulationEngineReadAdapter, type GovernedPopulationDashboardPopulationEngineReadAdapter } from "./governed-population-dashboard-population-engine-adapter";
import type { GovernedPopulationDashboardPopulationEngineResult } from "./governed-population-dashboard-population-engine";
export type UseGovernedPopulationDashboardPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPopulationDashboardPopulationEngineReadAdapter };
export type UseGovernedPopulationDashboardPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedPopulationDashboardPopulationEngineResult | null; refresh: () => void };
export function useGovernedPopulationDashboardPopulationEngine(options: UseGovernedPopulationDashboardPopulationEngineOptions): UseGovernedPopulationDashboardPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedPopulationDashboardPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPopulationDashboardPopulationEngineResult | null>(null);
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
