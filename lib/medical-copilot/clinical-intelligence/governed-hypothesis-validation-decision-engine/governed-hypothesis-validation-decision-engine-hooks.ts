"use client";
import { useCallback, useEffect, useState } from "react";
import { governedHypothesisValidationEngineReadAdapter, type GovernedHypothesisValidationEngineReadAdapter } from "./governed-hypothesis-validation-decision-engine-adapter";
import type { GovernedHypothesisValidationEngineResult } from "./governed-hypothesis-validation-decision-engine";
export type UseGovernedHypothesisValidationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedHypothesisValidationEngineReadAdapter };
export type UseGovernedHypothesisValidationEngineResult = { loading: boolean; error: string | null; result: GovernedHypothesisValidationEngineResult | null; refresh: () => void };
export function useGovernedHypothesisValidationEngine(options: UseGovernedHypothesisValidationEngineOptions): UseGovernedHypothesisValidationEngineResult {
  const { sessionId, enabled = true, adapter = governedHypothesisValidationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedHypothesisValidationEngineResult | null>(null);
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
