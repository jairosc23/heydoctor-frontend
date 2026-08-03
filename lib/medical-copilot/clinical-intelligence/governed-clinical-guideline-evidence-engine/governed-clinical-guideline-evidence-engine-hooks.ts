"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalGuidelineEvidenceEngineReadAdapter, type GovernedClinicalGuidelineEvidenceEngineReadAdapter } from "./governed-clinical-guideline-evidence-engine-adapter";
import type { GovernedClinicalGuidelineEvidenceEngineResult } from "./governed-clinical-guideline-evidence-engine";
export type UseGovernedClinicalGuidelineEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalGuidelineEvidenceEngineReadAdapter };
export type UseGovernedClinicalGuidelineEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalGuidelineEvidenceEngineResult | null; refresh: () => void };
export function useGovernedClinicalGuidelineEvidenceEngine(options: UseGovernedClinicalGuidelineEvidenceEngineOptions): UseGovernedClinicalGuidelineEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalGuidelineEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalGuidelineEvidenceEngineResult | null>(null);
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
