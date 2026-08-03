"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedAdherenceAnalysisTherapeuticEngineReadAdapter, type GovernedAdherenceAnalysisTherapeuticEngineReadAdapter } from "./governed-adherence-analysis-therapeutic-engine-adapter";
import type { GovernedAdherenceAnalysisTherapeuticEngineResult } from "./governed-adherence-analysis-therapeutic-engine";
export type UseGovernedAdherenceAnalysisTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAdherenceAnalysisTherapeuticEngineReadAdapter };
export type UseGovernedAdherenceAnalysisTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedAdherenceAnalysisTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedAdherenceAnalysisTherapeuticEngine(options: UseGovernedAdherenceAnalysisTherapeuticEngineOptions): UseGovernedAdherenceAnalysisTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedAdherenceAnalysisTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAdherenceAnalysisTherapeuticEngineResult | null>(null);
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
