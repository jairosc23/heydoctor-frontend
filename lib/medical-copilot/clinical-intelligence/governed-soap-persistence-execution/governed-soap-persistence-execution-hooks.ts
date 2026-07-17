"use client";
import { useCallback, useEffect, useState } from "react";
import { governedSoapPersistenceExecutionReadAdapter, type GovernedSoapPersistenceExecutionReadAdapter } from "./governed-soap-persistence-execution-adapter";
import type { GovernedSoapPersistenceExecutionResult } from "./governed-soap-persistence-execution";
export type UseGovernedSoapPersistenceExecutionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSoapPersistenceExecutionReadAdapter };
export type UseGovernedSoapPersistenceExecutionResult = { loading: boolean; error: string | null; result: GovernedSoapPersistenceExecutionResult | null; refresh: () => void };
export function useGovernedSoapPersistenceExecution(options: UseGovernedSoapPersistenceExecutionOptions): UseGovernedSoapPersistenceExecutionResult {
  const { sessionId, enabled = true, adapter = governedSoapPersistenceExecutionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSoapPersistenceExecutionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedSoapPersistenceExecution(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
