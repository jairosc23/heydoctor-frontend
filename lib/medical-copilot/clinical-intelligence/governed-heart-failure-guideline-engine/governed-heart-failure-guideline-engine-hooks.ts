"use client";
import { useCallback, useEffect, useState } from "react";
import { governedHeartFailureGuidelineEngineReadAdapter, type GovernedHeartFailureGuidelineEngineReadAdapter } from "./governed-heart-failure-guideline-engine-adapter";
import type { GovernedHeartFailureGuidelineEngineResult } from "./governed-heart-failure-guideline-engine";
export type UseGovernedHeartFailureGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedHeartFailureGuidelineEngineReadAdapter };
export type UseGovernedHeartFailureGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedHeartFailureGuidelineEngineResult | null; refresh: () => void };
export function useGovernedHeartFailureGuidelineEngine(options: UseGovernedHeartFailureGuidelineEngineOptions): UseGovernedHeartFailureGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedHeartFailureGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedHeartFailureGuidelineEngineResult | null>(null);
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
