"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalIntelligenceOutputReadAdapter, type ClinicalIntelligenceOutputReadAdapter } from "./clinical-intelligence-output-adapter";
import type { ClinicalIntelligenceOutputBuilderResult } from "./clinical-intelligence-output";
export type UseClinicalIntelligenceOutputOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalIntelligenceOutputReadAdapter; };
export type UseClinicalIntelligenceOutputResult = { loading: boolean; error: string | null; result: ClinicalIntelligenceOutputBuilderResult | null; refresh: () => void; };
export function useClinicalIntelligenceOutput(options: UseClinicalIntelligenceOutputOptions): UseClinicalIntelligenceOutputResult {
  const { sessionId, enabled = true, adapter = clinicalIntelligenceOutputReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalIntelligenceOutputBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalIntelligenceOutput(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
