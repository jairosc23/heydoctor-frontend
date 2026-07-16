"use client";
import { useCallback, useEffect, useState } from "react";
import { completenessReadAdapter, type ClinicalCompletenessAnalyzerReadAdapter } from "./clinical-completeness-analyzer-adapter";
import type { ClinicalCompletenessAnalyzerResultBuilderResult } from "./clinical-completeness-analyzer";

export type UseClinicalCompletenessAnalyzerResultOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalCompletenessAnalyzerReadAdapter;
};
export type UseClinicalCompletenessAnalyzerResultResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalCompletenessAnalyzerResultBuilderResult | null;
  refresh: () => void;
};

export function useClinicalCompletenessAnalyzer(options: UseClinicalCompletenessAnalyzerResultOptions): UseClinicalCompletenessAnalyzerResultResult {
  const { sessionId, enabled = true, adapter = completenessReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalCompletenessAnalyzerResultBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalCompletenessAnalyzer(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
