"use client";
import { useCallback, useEffect, useState } from "react";
import { governedAcogGuidelineEngineReadAdapter, type GovernedAcogGuidelineEngineReadAdapter } from "./governed-acog-guideline-engine-adapter";
import type { GovernedAcogGuidelineEngineResult } from "./governed-acog-guideline-engine";
export type UseGovernedAcogGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAcogGuidelineEngineReadAdapter };
export type UseGovernedAcogGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedAcogGuidelineEngineResult | null; refresh: () => void };
export function useGovernedAcogGuidelineEngine(options: UseGovernedAcogGuidelineEngineOptions): UseGovernedAcogGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedAcogGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAcogGuidelineEngineResult | null>(null);
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
