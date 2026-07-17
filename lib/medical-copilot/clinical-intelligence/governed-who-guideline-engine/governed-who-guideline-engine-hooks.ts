"use client";
import { useCallback, useEffect, useState } from "react";
import { governedWhoGuidelineEngineReadAdapter, type GovernedWhoGuidelineEngineReadAdapter } from "./governed-who-guideline-engine-adapter";
import type { GovernedWhoGuidelineEngineResult } from "./governed-who-guideline-engine";
export type UseGovernedWhoGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedWhoGuidelineEngineReadAdapter };
export type UseGovernedWhoGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedWhoGuidelineEngineResult | null; refresh: () => void };
export function useGovernedWhoGuidelineEngine(options: UseGovernedWhoGuidelineEngineOptions): UseGovernedWhoGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedWhoGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedWhoGuidelineEngineResult | null>(null);
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
