"use client";
import { useCallback, useEffect, useState } from "react";
import { providerExecutionReadAdapter, type GovernedProviderExecutionResultReadAdapter } from "./governed-provider-execution-adapter";
import type { GovernedProviderExecutionResultBuilderResult } from "./governed-provider-execution";

export type UseGovernedProviderExecutionResultOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedProviderExecutionResultReadAdapter;
};
export type UseGovernedProviderExecutionResultResult = {
  loading: boolean;
  error: string | null;
  result: GovernedProviderExecutionResultBuilderResult | null;
  refresh: () => void;
};

export function useGovernedProviderExecution(options: UseGovernedProviderExecutionResultOptions): UseGovernedProviderExecutionResultResult {
  const { sessionId, enabled = true, adapter = providerExecutionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedProviderExecutionResultBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedProviderExecution(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
