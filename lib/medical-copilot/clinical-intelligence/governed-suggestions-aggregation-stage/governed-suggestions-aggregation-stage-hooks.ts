"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedSuggestionsAggregationStageReadAdapter, type GovernedSuggestionsAggregationStageReadAdapter } from "./governed-suggestions-aggregation-stage-adapter";
import type { GovernedSuggestionsAggregationStageResult } from "./governed-suggestions-aggregation-stage";
export type UseGovernedSuggestionsAggregationStageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSuggestionsAggregationStageReadAdapter };
export type UseGovernedSuggestionsAggregationStageResult = { loading: boolean; error: string | null; result: GovernedSuggestionsAggregationStageResult | null; refresh: () => void };
export function useGovernedSuggestionsAggregationStage(options: UseGovernedSuggestionsAggregationStageOptions): UseGovernedSuggestionsAggregationStageResult {
  const { sessionId, enabled = true, adapter = governedSuggestionsAggregationStageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSuggestionsAggregationStageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedSuggestionsAggregationStage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
