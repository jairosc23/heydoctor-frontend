"use client";
import { useCallback, useEffect, useState } from "react";
import { processedReadAdapter, type GovernedProcessedAIResponseReadAdapter } from "./governed-ai-response-processing-adapter";
import type { GovernedProcessedAIResponseBuilderResult } from "./governed-ai-response-processing";

export type UseGovernedProcessedAIResponseOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedProcessedAIResponseReadAdapter;
};
export type UseGovernedProcessedAIResponseResult = {
  loading: boolean;
  error: string | null;
  result: GovernedProcessedAIResponseBuilderResult | null;
  refresh: () => void;
};

export function useGovernedAIResponseProcessing(options: UseGovernedProcessedAIResponseOptions): UseGovernedProcessedAIResponseResult {
  const { sessionId, enabled = true, adapter = processedReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedProcessedAIResponseBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedAIResponseProcessing(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
