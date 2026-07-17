"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningGraphReadAdapter, type ClinicalReasoningGraphReadAdapter } from "./clinical-reasoning-graph-adapter";
import type { ClinicalReasoningGraphBuilderResult } from "./clinical-reasoning-graph";
export type UseClinicalReasoningGraphOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningGraphReadAdapter; };
export type UseClinicalReasoningGraphResult = { loading: boolean; error: string | null; result: ClinicalReasoningGraphBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningGraph(options: UseClinicalReasoningGraphOptions): UseClinicalReasoningGraphResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningGraphReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningGraphBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningGraph(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
