"use client";
import { useCallback, useEffect, useState } from "react";
import { gapAnalyzerReadAdapter, type DiagnosticGapAnalyzerReadAdapter } from "./diagnostic-gap-analyzer-adapter";
import type { DiagnosticGapAnalyzerResultBuilderResult } from "./diagnostic-gap-analyzer";

export type UseDiagnosticGapAnalyzerResultOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: DiagnosticGapAnalyzerReadAdapter;
};
export type UseDiagnosticGapAnalyzerResultResult = {
  loading: boolean;
  error: string | null;
  result: DiagnosticGapAnalyzerResultBuilderResult | null;
  refresh: () => void;
};

export function useDiagnosticGapAnalyzer(options: UseDiagnosticGapAnalyzerResultOptions): UseDiagnosticGapAnalyzerResultResult {
  const { sessionId, enabled = true, adapter = gapAnalyzerReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticGapAnalyzerResultBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getDiagnosticGapAnalyzer(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
