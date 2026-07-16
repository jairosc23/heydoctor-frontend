"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCockcroftGaultCalculationEngineReadAdapter, type GovernedCockcroftGaultCalculationEngineReadAdapter } from "./governed-cockcroft-gault-calculation-engine-adapter";
import type { GovernedCockcroftGaultCalculationEngineResult } from "./governed-cockcroft-gault-calculation-engine";
export type UseGovernedCockcroftGaultCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCockcroftGaultCalculationEngineReadAdapter };
export type UseGovernedCockcroftGaultCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedCockcroftGaultCalculationEngineResult | null; refresh: () => void };
export function useGovernedCockcroftGaultCalculationEngine(options: UseGovernedCockcroftGaultCalculationEngineOptions): UseGovernedCockcroftGaultCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedCockcroftGaultCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCockcroftGaultCalculationEngineResult | null>(null);
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
