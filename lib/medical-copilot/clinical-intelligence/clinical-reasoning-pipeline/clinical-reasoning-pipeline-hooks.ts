"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningPipelineReadAdapter, type ClinicalReasoningPipelineReadAdapter } from "./clinical-reasoning-pipeline-adapter";
import type { ClinicalReasoningPipelineBuilderResult } from "./clinical-reasoning-pipeline";
export type UseClinicalReasoningPipelineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningPipelineReadAdapter; };
export type UseClinicalReasoningPipelineResult = { loading: boolean; error: string | null; result: ClinicalReasoningPipelineBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningPipeline(options: UseClinicalReasoningPipelineOptions): UseClinicalReasoningPipelineResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningPipelineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningPipelineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningPipeline(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
