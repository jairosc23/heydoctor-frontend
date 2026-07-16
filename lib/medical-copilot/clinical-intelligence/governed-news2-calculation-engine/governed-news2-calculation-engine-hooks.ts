"use client";
import { useCallback, useEffect, useState } from "react";
import { governedNews2CalculationEngineReadAdapter, type GovernedNews2CalculationEngineReadAdapter } from "./governed-news2-calculation-engine-adapter";
import type { GovernedNews2CalculationEngineResult } from "./governed-news2-calculation-engine";
export type UseGovernedNews2CalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedNews2CalculationEngineReadAdapter };
export type UseGovernedNews2CalculationEngineResult = { loading: boolean; error: string | null; result: GovernedNews2CalculationEngineResult | null; refresh: () => void };
export function useGovernedNews2CalculationEngine(options: UseGovernedNews2CalculationEngineOptions): UseGovernedNews2CalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedNews2CalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedNews2CalculationEngineResult | null>(null);
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
