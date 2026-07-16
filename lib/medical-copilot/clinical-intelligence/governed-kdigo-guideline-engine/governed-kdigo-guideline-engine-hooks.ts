"use client";
import { useCallback, useEffect, useState } from "react";
import { governedKdigoGuidelineEngineReadAdapter, type GovernedKdigoGuidelineEngineReadAdapter } from "./governed-kdigo-guideline-engine-adapter";
import type { GovernedKdigoGuidelineEngineResult } from "./governed-kdigo-guideline-engine";
export type UseGovernedKdigoGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedKdigoGuidelineEngineReadAdapter };
export type UseGovernedKdigoGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedKdigoGuidelineEngineResult | null; refresh: () => void };
export function useGovernedKdigoGuidelineEngine(options: UseGovernedKdigoGuidelineEngineOptions): UseGovernedKdigoGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedKdigoGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedKdigoGuidelineEngineResult | null>(null);
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
