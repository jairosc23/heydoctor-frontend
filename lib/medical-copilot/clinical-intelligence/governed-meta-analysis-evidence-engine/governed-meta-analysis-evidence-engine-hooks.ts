"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMetaAnalysisEvidenceEngineReadAdapter, type GovernedMetaAnalysisEvidenceEngineReadAdapter } from "./governed-meta-analysis-evidence-engine-adapter";
import type { GovernedMetaAnalysisEvidenceEngineResult } from "./governed-meta-analysis-evidence-engine";
export type UseGovernedMetaAnalysisEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMetaAnalysisEvidenceEngineReadAdapter };
export type UseGovernedMetaAnalysisEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedMetaAnalysisEvidenceEngineResult | null; refresh: () => void };
export function useGovernedMetaAnalysisEvidenceEngine(options: UseGovernedMetaAnalysisEvidenceEngineOptions): UseGovernedMetaAnalysisEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedMetaAnalysisEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMetaAnalysisEvidenceEngineResult | null>(null);
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
