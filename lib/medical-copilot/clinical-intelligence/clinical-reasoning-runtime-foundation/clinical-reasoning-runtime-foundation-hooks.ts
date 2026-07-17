"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningRuntimeFoundationReadAdapter, type ClinicalReasoningRuntimeFoundationReadAdapter } from "./clinical-reasoning-runtime-foundation-adapter";
import type { ClinicalReasoningRuntimeFoundationBuilderResult } from "./clinical-reasoning-runtime-foundation";
export type UseClinicalReasoningRuntimeFoundationOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningRuntimeFoundationReadAdapter; };
export type UseClinicalReasoningRuntimeFoundationResult = { loading: boolean; error: string | null; result: ClinicalReasoningRuntimeFoundationBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningRuntimeFoundation(options: UseClinicalReasoningRuntimeFoundationOptions): UseClinicalReasoningRuntimeFoundationResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningRuntimeFoundationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningRuntimeFoundationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningRuntimeFoundation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
