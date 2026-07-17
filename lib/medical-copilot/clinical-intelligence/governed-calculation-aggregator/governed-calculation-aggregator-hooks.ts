"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCalculationAggregatorReadAdapter, type GovernedCalculationAggregatorReadAdapter } from "./governed-calculation-aggregator-adapter";
import type { GovernedCalculationAggregatorResult } from "./governed-calculation-aggregator";
export type UseGovernedCalculationAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCalculationAggregatorReadAdapter };
export type UseGovernedCalculationAggregatorResult = { loading: boolean; error: string | null; result: GovernedCalculationAggregatorResult | null; refresh: () => void };
export function useGovernedCalculationAggregator(options: UseGovernedCalculationAggregatorOptions): UseGovernedCalculationAggregatorResult {
  const { sessionId, enabled = true, adapter = governedCalculationAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCalculationAggregatorResult | null>(null);
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
