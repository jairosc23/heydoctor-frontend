"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedHeartScoreCalculationEngineReadAdapter, type GovernedHeartScoreCalculationEngineReadAdapter } from "./governed-heart-score-calculation-engine-adapter";
import type { GovernedHeartScoreCalculationEngineResult } from "./governed-heart-score-calculation-engine";
export type UseGovernedHeartScoreCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedHeartScoreCalculationEngineReadAdapter };
export type UseGovernedHeartScoreCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedHeartScoreCalculationEngineResult | null; refresh: () => void };
export function useGovernedHeartScoreCalculationEngine(options: UseGovernedHeartScoreCalculationEngineOptions): UseGovernedHeartScoreCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedHeartScoreCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedHeartScoreCalculationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
