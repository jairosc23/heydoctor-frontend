"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDecisionAggregatorReadAdapter, type GovernedDecisionAggregatorReadAdapter } from "./governed-decision-aggregator-adapter";
import type { GovernedDecisionAggregatorResult } from "./governed-decision-aggregator";
export type UseGovernedDecisionAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDecisionAggregatorReadAdapter };
export type UseGovernedDecisionAggregatorResult = { loading: boolean; error: string | null; result: GovernedDecisionAggregatorResult | null; refresh: () => void };
export function useGovernedDecisionAggregator(options: UseGovernedDecisionAggregatorOptions): UseGovernedDecisionAggregatorResult {
  const { sessionId, enabled = true, adapter = governedDecisionAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDecisionAggregatorResult | null>(null);
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
