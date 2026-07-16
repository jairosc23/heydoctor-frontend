"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCdcGuidelineEngineReadAdapter, type GovernedCdcGuidelineEngineReadAdapter } from "./governed-cdc-guideline-engine-adapter";
import type { GovernedCdcGuidelineEngineResult } from "./governed-cdc-guideline-engine";
export type UseGovernedCdcGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCdcGuidelineEngineReadAdapter };
export type UseGovernedCdcGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedCdcGuidelineEngineResult | null; refresh: () => void };
export function useGovernedCdcGuidelineEngine(options: UseGovernedCdcGuidelineEngineOptions): UseGovernedCdcGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedCdcGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCdcGuidelineEngineResult | null>(null);
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
