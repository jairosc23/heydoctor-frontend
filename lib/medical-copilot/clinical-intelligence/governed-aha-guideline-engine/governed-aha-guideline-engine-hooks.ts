"use client";
import { useCallback, useEffect, useState } from "react";
import { governedAhaGuidelineEngineReadAdapter, type GovernedAhaGuidelineEngineReadAdapter } from "./governed-aha-guideline-engine-adapter";
import type { GovernedAhaGuidelineEngineResult } from "./governed-aha-guideline-engine";
export type UseGovernedAhaGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAhaGuidelineEngineReadAdapter };
export type UseGovernedAhaGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedAhaGuidelineEngineResult | null; refresh: () => void };
export function useGovernedAhaGuidelineEngine(options: UseGovernedAhaGuidelineEngineOptions): UseGovernedAhaGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedAhaGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAhaGuidelineEngineResult | null>(null);
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
