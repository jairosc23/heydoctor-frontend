"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPhysicianReviewPreparationEngineReadAdapter, type GovernedPhysicianReviewPreparationEngineReadAdapter } from "./governed-physician-review-preparation-decision-engine-adapter";
import type { GovernedPhysicianReviewPreparationEngineResult } from "./governed-physician-review-preparation-decision-engine";
export type UseGovernedPhysicianReviewPreparationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPhysicianReviewPreparationEngineReadAdapter };
export type UseGovernedPhysicianReviewPreparationEngineResult = { loading: boolean; error: string | null; result: GovernedPhysicianReviewPreparationEngineResult | null; refresh: () => void };
export function useGovernedPhysicianReviewPreparationEngine(options: UseGovernedPhysicianReviewPreparationEngineOptions): UseGovernedPhysicianReviewPreparationEngineResult {
  const { sessionId, enabled = true, adapter = governedPhysicianReviewPreparationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianReviewPreparationEngineResult | null>(null);
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
