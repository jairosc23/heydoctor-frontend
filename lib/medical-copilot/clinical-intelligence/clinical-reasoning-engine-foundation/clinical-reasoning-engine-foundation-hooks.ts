"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningEngineFoundationReadAdapter, type ClinicalReasoningEngineFoundationReadAdapter } from "./clinical-reasoning-engine-foundation-adapter";
import type { ClinicalReasoningEngineFoundationBuilderResult } from "./clinical-reasoning-engine-foundation";
export type UseClinicalReasoningEngineFoundationOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningEngineFoundationReadAdapter; };
export type UseClinicalReasoningEngineFoundationResult = { loading: boolean; error: string | null; result: ClinicalReasoningEngineFoundationBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningEngineFoundation(options: UseClinicalReasoningEngineFoundationOptions): UseClinicalReasoningEngineFoundationResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningEngineFoundationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningEngineFoundationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningEngineFoundation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
