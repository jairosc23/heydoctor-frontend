"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningContextReadAdapter, type ClinicalReasoningContextReadAdapter } from "./clinical-reasoning-context-adapter";
import type { ClinicalReasoningContextBuilderResult } from "./clinical-reasoning-context";
export type UseClinicalReasoningContextOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningContextReadAdapter; };
export type UseClinicalReasoningContextResult = { loading: boolean; error: string | null; result: ClinicalReasoningContextBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningContext(options: UseClinicalReasoningContextOptions): UseClinicalReasoningContextResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningContextReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningContextBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningContext(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
