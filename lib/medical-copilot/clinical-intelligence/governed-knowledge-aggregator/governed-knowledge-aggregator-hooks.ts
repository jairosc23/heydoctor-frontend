"use client";
import { useCallback, useEffect, useState } from "react";
import { governedKnowledgeAggregatorReadAdapter, type GovernedKnowledgeAggregatorReadAdapter } from "./governed-knowledge-aggregator-adapter";
import type { GovernedKnowledgeAggregatorResult } from "./governed-knowledge-aggregator";
export type UseGovernedKnowledgeAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedKnowledgeAggregatorReadAdapter };
export type UseGovernedKnowledgeAggregatorResult = { loading: boolean; error: string | null; result: GovernedKnowledgeAggregatorResult | null; refresh: () => void };
export function useGovernedKnowledgeAggregator(options: UseGovernedKnowledgeAggregatorOptions): UseGovernedKnowledgeAggregatorResult {
  const { sessionId, enabled = true, adapter = governedKnowledgeAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedKnowledgeAggregatorResult | null>(null);
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
