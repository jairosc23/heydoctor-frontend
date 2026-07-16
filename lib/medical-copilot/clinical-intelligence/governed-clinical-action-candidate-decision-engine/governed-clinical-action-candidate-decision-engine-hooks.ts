"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalActionCandidateEngineReadAdapter, type GovernedClinicalActionCandidateEngineReadAdapter } from "./governed-clinical-action-candidate-decision-engine-adapter";
import type { GovernedClinicalActionCandidateEngineResult } from "./governed-clinical-action-candidate-decision-engine";
export type UseGovernedClinicalActionCandidateEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalActionCandidateEngineReadAdapter };
export type UseGovernedClinicalActionCandidateEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalActionCandidateEngineResult | null; refresh: () => void };
export function useGovernedClinicalActionCandidateEngine(options: UseGovernedClinicalActionCandidateEngineOptions): UseGovernedClinicalActionCandidateEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalActionCandidateEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActionCandidateEngineResult | null>(null);
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
