"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedChronicDiseaseFollowUpAnalysisReadAdapter, type GovernedChronicDiseaseFollowUpAnalysisReadAdapter } from "./governed-chronic-disease-follow-up-analysis-adapter";
import type { GovernedChronicDiseaseFollowUpAnalysisResult } from "./governed-chronic-disease-follow-up-analysis";

export type UseGovernedChronicDiseaseFollowUpAnalysisOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedChronicDiseaseFollowUpAnalysisReadAdapter };
export type UseGovernedChronicDiseaseFollowUpAnalysisResult = { loading: boolean; error: string | null; result: GovernedChronicDiseaseFollowUpAnalysisResult | null; refresh: () => void };

export function useGovernedChronicDiseaseFollowUpAnalysis(options: UseGovernedChronicDiseaseFollowUpAnalysisOptions): UseGovernedChronicDiseaseFollowUpAnalysisResult {
  const { sessionId, enabled = true, adapter = governedChronicDiseaseFollowUpAnalysisReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedChronicDiseaseFollowUpAnalysisResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedChronicDiseaseFollowUpAnalysis(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
