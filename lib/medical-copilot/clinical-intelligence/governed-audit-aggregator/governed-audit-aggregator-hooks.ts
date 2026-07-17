"use client";
import { useCallback, useEffect, useState } from "react";
import { governedAuditAggregatorReadAdapter, type GovernedAuditAggregatorReadAdapter } from "./governed-audit-aggregator-adapter";
import type { GovernedAuditAggregatorResult } from "./governed-audit-aggregator";
export type UseGovernedAuditAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAuditAggregatorReadAdapter };
export type UseGovernedAuditAggregatorResult = { loading: boolean; error: string | null; result: GovernedAuditAggregatorResult | null; refresh: () => void };
export function useGovernedAuditAggregator(options: UseGovernedAuditAggregatorOptions): UseGovernedAuditAggregatorResult {
  const { sessionId, enabled = true, adapter = governedAuditAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAuditAggregatorResult | null>(null);
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
