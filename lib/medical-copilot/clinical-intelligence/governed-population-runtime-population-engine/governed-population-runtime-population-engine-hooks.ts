"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPopulationRuntimePopulationEngineReadAdapter, type GovernedPopulationRuntimePopulationEngineReadAdapter } from "./governed-population-runtime-population-engine-adapter";
import type { GovernedPopulationRuntimePopulationEngineResult } from "./governed-population-runtime-population-engine";
export type UseGovernedPopulationRuntimePopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPopulationRuntimePopulationEngineReadAdapter };
export type UseGovernedPopulationRuntimePopulationEngineResult = { loading: boolean; error: string | null; result: GovernedPopulationRuntimePopulationEngineResult | null; refresh: () => void };
export function useGovernedPopulationRuntimePopulationEngine(options: UseGovernedPopulationRuntimePopulationEngineOptions): UseGovernedPopulationRuntimePopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedPopulationRuntimePopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPopulationRuntimePopulationEngineResult | null>(null);
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
