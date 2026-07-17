"use client";
import { useCallback, useEffect, useState } from "react";
import { governedRulesEvaluationStageReadAdapter, type GovernedRulesEvaluationStageReadAdapter } from "./governed-rules-evaluation-stage-adapter";
import type { GovernedRulesEvaluationStageResult } from "./governed-rules-evaluation-stage";
export type UseGovernedRulesEvaluationStageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRulesEvaluationStageReadAdapter };
export type UseGovernedRulesEvaluationStageResult = { loading: boolean; error: string | null; result: GovernedRulesEvaluationStageResult | null; refresh: () => void };
export function useGovernedRulesEvaluationStage(options: UseGovernedRulesEvaluationStageOptions): UseGovernedRulesEvaluationStageResult {
  const { sessionId, enabled = true, adapter = governedRulesEvaluationStageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRulesEvaluationStageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedRulesEvaluationStage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
