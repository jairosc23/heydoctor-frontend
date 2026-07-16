"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDecisionConfidenceAggregationEngineReadAdapter, type GovernedDecisionConfidenceAggregationEngineReadAdapter } from "./governed-decision-confidence-aggregation-engine-adapter";
import type { GovernedDecisionConfidenceAggregationEngineResult } from "./governed-decision-confidence-aggregation-engine";
export type UseGovernedDecisionConfidenceAggregationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDecisionConfidenceAggregationEngineReadAdapter };
export type UseGovernedDecisionConfidenceAggregationEngineResult = { loading: boolean; error: string | null; result: GovernedDecisionConfidenceAggregationEngineResult | null; refresh: () => void };
export function useGovernedDecisionConfidenceAggregationEngine(options: UseGovernedDecisionConfidenceAggregationEngineOptions): UseGovernedDecisionConfidenceAggregationEngineResult {
  const { sessionId, enabled = true, adapter = governedDecisionConfidenceAggregationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDecisionConfidenceAggregationEngineResult | null>(null);
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
