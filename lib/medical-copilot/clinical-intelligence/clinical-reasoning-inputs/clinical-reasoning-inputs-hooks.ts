"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningInputsReadAdapter, type ClinicalReasoningInputsReadAdapter } from "./clinical-reasoning-inputs-adapter";
import type { ClinicalReasoningInputsBuilderResult } from "./clinical-reasoning-inputs";
export type UseClinicalReasoningInputsOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningInputsReadAdapter; };
export type UseClinicalReasoningInputsResult = { loading: boolean; error: string | null; result: ClinicalReasoningInputsBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningInputs(options: UseClinicalReasoningInputsOptions): UseClinicalReasoningInputsResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningInputsReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningInputsBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningInputs(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
