"use client";
import { useCallback, useEffect, useState } from "react";
import { governedSafetyAggregatorReadAdapter, type GovernedSafetyAggregatorReadAdapter } from "./governed-safety-aggregator-adapter";
import type { GovernedSafetyAggregatorResult } from "./governed-safety-aggregator";
export type UseGovernedSafetyAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSafetyAggregatorReadAdapter };
export type UseGovernedSafetyAggregatorResult = { loading: boolean; error: string | null; result: GovernedSafetyAggregatorResult | null; refresh: () => void };
export function useGovernedSafetyAggregator(options: UseGovernedSafetyAggregatorOptions): UseGovernedSafetyAggregatorResult {
  const { sessionId, enabled = true, adapter = governedSafetyAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSafetyAggregatorResult | null>(null);
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
