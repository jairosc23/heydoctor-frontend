"use client";
import { useCallback, useEffect, useState } from "react";
import { governedAapGuidelineEngineReadAdapter, type GovernedAapGuidelineEngineReadAdapter } from "./governed-aap-guideline-engine-adapter";
import type { GovernedAapGuidelineEngineResult } from "./governed-aap-guideline-engine";
export type UseGovernedAapGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAapGuidelineEngineReadAdapter };
export type UseGovernedAapGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedAapGuidelineEngineResult | null; refresh: () => void };
export function useGovernedAapGuidelineEngine(options: UseGovernedAapGuidelineEngineOptions): UseGovernedAapGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedAapGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAapGuidelineEngineResult | null>(null);
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
