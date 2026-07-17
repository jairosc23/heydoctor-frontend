"use client";
import { useCallback, useEffect, useState } from "react";
import { governedOrdersPersistenceExecutionReadAdapter, type GovernedOrdersPersistenceExecutionReadAdapter } from "./governed-orders-persistence-execution-adapter";
import type { GovernedOrdersPersistenceExecutionResult } from "./governed-orders-persistence-execution";
export type UseGovernedOrdersPersistenceExecutionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedOrdersPersistenceExecutionReadAdapter };
export type UseGovernedOrdersPersistenceExecutionResult = { loading: boolean; error: string | null; result: GovernedOrdersPersistenceExecutionResult | null; refresh: () => void };
export function useGovernedOrdersPersistenceExecution(options: UseGovernedOrdersPersistenceExecutionOptions): UseGovernedOrdersPersistenceExecutionResult {
  const { sessionId, enabled = true, adapter = governedOrdersPersistenceExecutionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedOrdersPersistenceExecutionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedOrdersPersistenceExecution(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
