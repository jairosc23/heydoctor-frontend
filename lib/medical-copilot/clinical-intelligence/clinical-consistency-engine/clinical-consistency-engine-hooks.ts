"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalConsistencyEngineReadAdapter, type ClinicalConsistencyEngineReadAdapter } from "./clinical-consistency-engine-adapter";
import type { ClinicalConsistencyEngineBuilderResult } from "./clinical-consistency-engine";
export type UseClinicalConsistencyEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalConsistencyEngineReadAdapter; };
export type UseClinicalConsistencyEngineResult = { loading: boolean; error: string | null; result: ClinicalConsistencyEngineBuilderResult | null; refresh: () => void; };
export function useClinicalConsistencyEngine(options: UseClinicalConsistencyEngineOptions): UseClinicalConsistencyEngineResult {
  const { sessionId, enabled = true, adapter = clinicalConsistencyEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalConsistencyEngineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalConsistencyEngine(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
