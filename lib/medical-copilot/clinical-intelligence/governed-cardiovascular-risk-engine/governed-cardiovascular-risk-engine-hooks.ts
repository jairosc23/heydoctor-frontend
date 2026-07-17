"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCardiovascularRiskEngineReadAdapter, type GovernedCardiovascularRiskEngineReadAdapter } from "./governed-cardiovascular-risk-engine-adapter";
import type { GovernedCardiovascularRiskEngineResult } from "./governed-cardiovascular-risk-engine";
export type UseGovernedCardiovascularRiskEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCardiovascularRiskEngineReadAdapter };
export type UseGovernedCardiovascularRiskEngineResult = { loading: boolean; error: string | null; result: GovernedCardiovascularRiskEngineResult | null; refresh: () => void };
export function useGovernedCardiovascularRiskEngine(options: UseGovernedCardiovascularRiskEngineOptions): UseGovernedCardiovascularRiskEngineResult {
  const { sessionId, enabled = true, adapter = governedCardiovascularRiskEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCardiovascularRiskEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedCardiovascularRiskEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
