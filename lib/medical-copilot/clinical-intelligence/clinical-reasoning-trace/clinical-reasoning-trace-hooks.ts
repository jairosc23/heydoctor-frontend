"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningTraceReadAdapter, type ClinicalReasoningTraceReadAdapter } from "./clinical-reasoning-trace-adapter";
import type { ClinicalReasoningTraceBuilderResult } from "./clinical-reasoning-trace";
export type UseClinicalReasoningTraceOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningTraceReadAdapter; };
export type UseClinicalReasoningTraceResult = { loading: boolean; error: string | null; result: ClinicalReasoningTraceBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningTrace(options: UseClinicalReasoningTraceOptions): UseClinicalReasoningTraceResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningTraceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningTraceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningTrace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
