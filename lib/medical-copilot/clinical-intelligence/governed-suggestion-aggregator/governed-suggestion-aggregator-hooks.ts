"use client";
import { useCallback, useEffect, useState } from "react";
import { governedSuggestionAggregatorReadAdapter, type GovernedSuggestionAggregatorReadAdapter } from "./governed-suggestion-aggregator-adapter";
import type { GovernedSuggestionAggregatorResult } from "./governed-suggestion-aggregator";
export type UseGovernedSuggestionAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSuggestionAggregatorReadAdapter };
export type UseGovernedSuggestionAggregatorResult = { loading: boolean; error: string | null; result: GovernedSuggestionAggregatorResult | null; refresh: () => void };
export function useGovernedSuggestionAggregator(options: UseGovernedSuggestionAggregatorOptions): UseGovernedSuggestionAggregatorResult {
  const { sessionId, enabled = true, adapter = governedSuggestionAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSuggestionAggregatorResult | null>(null);
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
