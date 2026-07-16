"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalQuestionsReadAdapter, type ClinicalQuestionGeneratorReadAdapter } from "./clinical-question-generator-adapter";
import type { ClinicalQuestionGeneratorResultBuilderResult } from "./clinical-question-generator";

export type UseClinicalQuestionGeneratorResultOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalQuestionGeneratorReadAdapter;
};
export type UseClinicalQuestionGeneratorResultResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalQuestionGeneratorResultBuilderResult | null;
  refresh: () => void;
};

export function useClinicalQuestionGenerator(options: UseClinicalQuestionGeneratorResultOptions): UseClinicalQuestionGeneratorResultResult {
  const { sessionId, enabled = true, adapter = clinicalQuestionsReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalQuestionGeneratorResultBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalQuestionGenerator(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
