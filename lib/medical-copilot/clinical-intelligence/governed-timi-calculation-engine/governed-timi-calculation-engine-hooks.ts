"use client";
import { useCallback, useEffect, useState } from "react";
import { governedTimiCalculationEngineReadAdapter, type GovernedTimiCalculationEngineReadAdapter } from "./governed-timi-calculation-engine-adapter";
import type { GovernedTimiCalculationEngineResult } from "./governed-timi-calculation-engine";
export type UseGovernedTimiCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedTimiCalculationEngineReadAdapter };
export type UseGovernedTimiCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedTimiCalculationEngineResult | null; refresh: () => void };
export function useGovernedTimiCalculationEngine(options: UseGovernedTimiCalculationEngineOptions): UseGovernedTimiCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedTimiCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedTimiCalculationEngineResult | null>(null);
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
