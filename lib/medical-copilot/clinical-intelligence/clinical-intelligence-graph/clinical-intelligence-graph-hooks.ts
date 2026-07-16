"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalIntelligenceGraphReadAdapter, type ClinicalIntelligenceGraphReadAdapter } from "./clinical-intelligence-graph-adapter";
import type { ClinicalIntelligenceGraphBuilderResult } from "./clinical-intelligence-graph";
export type UseClinicalIntelligenceGraphOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalIntelligenceGraphReadAdapter; };
export type UseClinicalIntelligenceGraphResult = { loading: boolean; error: string | null; result: ClinicalIntelligenceGraphBuilderResult | null; refresh: () => void; };
export function useClinicalIntelligenceGraph(options: UseClinicalIntelligenceGraphOptions): UseClinicalIntelligenceGraphResult {
  const { sessionId, enabled = true, adapter = clinicalIntelligenceGraphReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalIntelligenceGraphBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalIntelligenceGraph(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
