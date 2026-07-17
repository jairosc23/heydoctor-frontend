"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceTraceabilityEngineReadAdapter, type GovernedEvidenceTraceabilityEngineReadAdapter } from "./governed-evidence-traceability-engine-adapter";
import type { GovernedEvidenceTraceabilityEngineResult } from "./governed-evidence-traceability-engine";
export type UseGovernedEvidenceTraceabilityEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceTraceabilityEngineReadAdapter };
export type UseGovernedEvidenceTraceabilityEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceTraceabilityEngineResult | null; refresh: () => void };
export function useGovernedEvidenceTraceabilityEngine(options: UseGovernedEvidenceTraceabilityEngineOptions): UseGovernedEvidenceTraceabilityEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceTraceabilityEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceTraceabilityEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
