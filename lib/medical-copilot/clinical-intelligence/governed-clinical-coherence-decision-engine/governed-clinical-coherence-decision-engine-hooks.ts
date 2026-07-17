"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalCoherenceEngineReadAdapter, type GovernedClinicalCoherenceEngineReadAdapter } from "./governed-clinical-coherence-decision-engine-adapter";
import type { GovernedClinicalCoherenceEngineResult } from "./governed-clinical-coherence-decision-engine";
export type UseGovernedClinicalCoherenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalCoherenceEngineReadAdapter };
export type UseGovernedClinicalCoherenceEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalCoherenceEngineResult | null; refresh: () => void };
export function useGovernedClinicalCoherenceEngine(options: UseGovernedClinicalCoherenceEngineOptions): UseGovernedClinicalCoherenceEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalCoherenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalCoherenceEngineResult | null>(null);
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
