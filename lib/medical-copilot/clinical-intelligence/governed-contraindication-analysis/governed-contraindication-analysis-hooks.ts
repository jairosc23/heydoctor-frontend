"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedContraindicationAnalysisReadAdapter, type GovernedContraindicationAnalysisReadAdapter } from "./governed-contraindication-analysis-adapter";
import type { GovernedContraindicationAnalysisResult } from "./governed-contraindication-analysis";

export type UseGovernedContraindicationAnalysisOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedContraindicationAnalysisReadAdapter };
export type UseGovernedContraindicationAnalysisResult = { loading: boolean; error: string | null; result: GovernedContraindicationAnalysisResult | null; refresh: () => void };

export function useGovernedContraindicationAnalysis(options: UseGovernedContraindicationAnalysisOptions): UseGovernedContraindicationAnalysisResult {
  const { sessionId, enabled = true, adapter = governedContraindicationAnalysisReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedContraindicationAnalysisResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedContraindicationAnalysis(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
