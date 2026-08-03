"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceAggregationStageReadAdapter, type GovernedEvidenceAggregationStageReadAdapter } from "./governed-evidence-aggregation-stage-adapter";
import type { GovernedEvidenceAggregationStageResult } from "./governed-evidence-aggregation-stage";
export type UseGovernedEvidenceAggregationStageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceAggregationStageReadAdapter };
export type UseGovernedEvidenceAggregationStageResult = { loading: boolean; error: string | null; result: GovernedEvidenceAggregationStageResult | null; refresh: () => void };
export function useGovernedEvidenceAggregationStage(options: UseGovernedEvidenceAggregationStageOptions): UseGovernedEvidenceAggregationStageResult {
  const { sessionId, enabled = true, adapter = governedEvidenceAggregationStageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceAggregationStageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedEvidenceAggregationStage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
