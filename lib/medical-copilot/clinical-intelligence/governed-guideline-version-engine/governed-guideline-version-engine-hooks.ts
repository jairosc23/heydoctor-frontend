"use client";
import { useCallback, useEffect, useState } from "react";
import { governedGuidelineVersionEngineReadAdapter, type GovernedGuidelineVersionEngineReadAdapter } from "./governed-guideline-version-engine-adapter";
import type { GovernedGuidelineVersionEngineResult } from "./governed-guideline-version-engine";
export type UseGovernedGuidelineVersionEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGuidelineVersionEngineReadAdapter };
export type UseGovernedGuidelineVersionEngineResult = { loading: boolean; error: string | null; result: GovernedGuidelineVersionEngineResult | null; refresh: () => void };
export function useGovernedGuidelineVersionEngine(options: UseGovernedGuidelineVersionEngineOptions): UseGovernedGuidelineVersionEngineResult {
  const { sessionId, enabled = true, adapter = governedGuidelineVersionEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGuidelineVersionEngineResult | null>(null);
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
