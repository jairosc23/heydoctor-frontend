"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCurb65CalculationEngineReadAdapter, type GovernedCurb65CalculationEngineReadAdapter } from "./governed-curb65-calculation-engine-adapter";
import type { GovernedCurb65CalculationEngineResult } from "./governed-curb65-calculation-engine";
export type UseGovernedCurb65CalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCurb65CalculationEngineReadAdapter };
export type UseGovernedCurb65CalculationEngineResult = { loading: boolean; error: string | null; result: GovernedCurb65CalculationEngineResult | null; refresh: () => void };
export function useGovernedCurb65CalculationEngine(options: UseGovernedCurb65CalculationEngineOptions): UseGovernedCurb65CalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedCurb65CalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCurb65CalculationEngineResult | null>(null);
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
