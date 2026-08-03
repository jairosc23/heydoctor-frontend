"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalContextAggregatorReadAdapter, type GovernedClinicalContextAggregatorReadAdapter } from "./governed-clinical-context-aggregator-adapter";
import type { GovernedClinicalContextAggregatorResult } from "./governed-clinical-context-aggregator";
export type UseGovernedClinicalContextAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalContextAggregatorReadAdapter };
export type UseGovernedClinicalContextAggregatorResult = { loading: boolean; error: string | null; result: GovernedClinicalContextAggregatorResult | null; refresh: () => void };
export function useGovernedClinicalContextAggregator(options: UseGovernedClinicalContextAggregatorOptions): UseGovernedClinicalContextAggregatorResult {
  const { sessionId, enabled = true, adapter = governedClinicalContextAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalContextAggregatorResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
