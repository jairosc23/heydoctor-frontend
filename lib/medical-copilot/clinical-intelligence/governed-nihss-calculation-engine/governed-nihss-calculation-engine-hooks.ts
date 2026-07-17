"use client";
import { useCallback, useEffect, useState } from "react";
import { governedNihssCalculationEngineReadAdapter, type GovernedNihssCalculationEngineReadAdapter } from "./governed-nihss-calculation-engine-adapter";
import type { GovernedNihssCalculationEngineResult } from "./governed-nihss-calculation-engine";
export type UseGovernedNihssCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedNihssCalculationEngineReadAdapter };
export type UseGovernedNihssCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedNihssCalculationEngineResult | null; refresh: () => void };
export function useGovernedNihssCalculationEngine(options: UseGovernedNihssCalculationEngineOptions): UseGovernedNihssCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedNihssCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedNihssCalculationEngineResult | null>(null);
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
