"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCaseSeriesEvidenceEngineReadAdapter, type GovernedCaseSeriesEvidenceEngineReadAdapter } from "./governed-case-series-evidence-engine-adapter";
import type { GovernedCaseSeriesEvidenceEngineResult } from "./governed-case-series-evidence-engine";
export type UseGovernedCaseSeriesEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCaseSeriesEvidenceEngineReadAdapter };
export type UseGovernedCaseSeriesEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedCaseSeriesEvidenceEngineResult | null; refresh: () => void };
export function useGovernedCaseSeriesEvidenceEngine(options: UseGovernedCaseSeriesEvidenceEngineOptions): UseGovernedCaseSeriesEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedCaseSeriesEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCaseSeriesEvidenceEngineResult | null>(null);
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
