"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticAggregatorReadAdapter, type GovernedDiagnosticAggregatorReadAdapter } from "./governed-diagnostic-aggregator-adapter";
import type { GovernedDiagnosticAggregatorResult } from "./governed-diagnostic-aggregator";
export type UseGovernedDiagnosticAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticAggregatorReadAdapter };
export type UseGovernedDiagnosticAggregatorResult = { loading: boolean; error: string | null; result: GovernedDiagnosticAggregatorResult | null; refresh: () => void };
export function useGovernedDiagnosticAggregator(options: UseGovernedDiagnosticAggregatorOptions): UseGovernedDiagnosticAggregatorResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticAggregatorResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
