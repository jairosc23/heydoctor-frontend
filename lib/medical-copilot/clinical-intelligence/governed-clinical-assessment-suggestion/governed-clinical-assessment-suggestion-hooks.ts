"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalAssessmentSuggestionReadAdapter, type GovernedClinicalAssessmentSuggestionReadAdapter } from "./governed-clinical-assessment-suggestion-adapter";
import type { GovernedClinicalAssessmentSuggestionResult } from "./governed-clinical-assessment-suggestion";

export type UseGovernedClinicalAssessmentSuggestionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalAssessmentSuggestionReadAdapter };
export type UseGovernedClinicalAssessmentSuggestionResult = { loading: boolean; error: string | null; result: GovernedClinicalAssessmentSuggestionResult | null; refresh: () => void };

export function useGovernedClinicalAssessmentSuggestion(options: UseGovernedClinicalAssessmentSuggestionOptions): UseGovernedClinicalAssessmentSuggestionResult {
  const { sessionId, enabled = true, adapter = governedClinicalAssessmentSuggestionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAssessmentSuggestionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalAssessmentSuggestion(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
