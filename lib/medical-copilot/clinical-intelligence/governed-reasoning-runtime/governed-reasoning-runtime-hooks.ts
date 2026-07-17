"use client";
import { useCallback, useEffect, useState } from "react";
import { governedReasoningRuntimeReadAdapter, type GovernedReasoningRuntimeReadAdapter } from "./governed-reasoning-runtime-adapter";
import type { GovernedReasoningRuntimeBuilderResult } from "./governed-reasoning-runtime";
export type UseGovernedReasoningRuntimeOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedReasoningRuntimeReadAdapter; };
export type UseGovernedReasoningRuntimeResult = { loading: boolean; error: string | null; result: GovernedReasoningRuntimeBuilderResult | null; refresh: () => void; };
export function useGovernedReasoningRuntime(options: UseGovernedReasoningRuntimeOptions): UseGovernedReasoningRuntimeResult {
  const { sessionId, enabled = true, adapter = governedReasoningRuntimeReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReasoningRuntimeBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReasoningRuntime(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
