"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticConfidenceEngineReadAdapter, type GovernedDiagnosticConfidenceEngineReadAdapter } from "./governed-diagnostic-confidence-decision-engine-adapter";
import type { GovernedDiagnosticConfidenceEngineResult } from "./governed-diagnostic-confidence-decision-engine";
export type UseGovernedDiagnosticConfidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticConfidenceEngineReadAdapter };
export type UseGovernedDiagnosticConfidenceEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticConfidenceEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticConfidenceEngine(options: UseGovernedDiagnosticConfidenceEngineOptions): UseGovernedDiagnosticConfidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticConfidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticConfidenceEngineResult | null>(null);
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
