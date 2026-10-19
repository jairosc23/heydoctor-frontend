"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCarePathwayOptimizationTherapeuticEngineReadAdapter, type GovernedCarePathwayOptimizationTherapeuticEngineReadAdapter } from "./governed-care-pathway-optimization-therapeutic-engine-adapter";
import type { GovernedCarePathwayOptimizationTherapeuticEngineResult } from "./governed-care-pathway-optimization-therapeutic-engine";
export type UseGovernedCarePathwayOptimizationTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCarePathwayOptimizationTherapeuticEngineReadAdapter };
export type UseGovernedCarePathwayOptimizationTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedCarePathwayOptimizationTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedCarePathwayOptimizationTherapeuticEngine(options: UseGovernedCarePathwayOptimizationTherapeuticEngineOptions): UseGovernedCarePathwayOptimizationTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedCarePathwayOptimizationTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCarePathwayOptimizationTherapeuticEngineResult | null>(null);
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
