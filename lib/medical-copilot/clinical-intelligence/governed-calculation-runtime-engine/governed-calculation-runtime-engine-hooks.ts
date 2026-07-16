"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCalculationRuntimeEngineReadAdapter, type GovernedCalculationRuntimeEngineReadAdapter } from "./governed-calculation-runtime-engine-adapter";
import type { GovernedCalculationRuntimeEngineResult } from "./governed-calculation-runtime-engine";
export type UseGovernedCalculationRuntimeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCalculationRuntimeEngineReadAdapter };
export type UseGovernedCalculationRuntimeEngineResult = { loading: boolean; error: string | null; result: GovernedCalculationRuntimeEngineResult | null; refresh: () => void };
export function useGovernedCalculationRuntimeEngine(options: UseGovernedCalculationRuntimeEngineOptions): UseGovernedCalculationRuntimeEngineResult {
  const { sessionId, enabled = true, adapter = governedCalculationRuntimeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCalculationRuntimeEngineResult | null>(null);
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
