"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedLongitudinalAggregatorReadAdapter, type GovernedLongitudinalAggregatorReadAdapter } from "./governed-longitudinal-aggregator-adapter";
import type { GovernedLongitudinalAggregatorResult } from "./governed-longitudinal-aggregator";
export type UseGovernedLongitudinalAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedLongitudinalAggregatorReadAdapter };
export type UseGovernedLongitudinalAggregatorResult = { loading: boolean; error: string | null; result: GovernedLongitudinalAggregatorResult | null; refresh: () => void };
export function useGovernedLongitudinalAggregator(options: UseGovernedLongitudinalAggregatorOptions): UseGovernedLongitudinalAggregatorResult {
  const { sessionId, enabled = true, adapter = governedLongitudinalAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedLongitudinalAggregatorResult | null>(null);
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
