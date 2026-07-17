"use client";
import { useCallback, useEffect, useState } from "react";
import { governedGeriatricAssessmentEngineReadAdapter, type GovernedGeriatricAssessmentEngineReadAdapter } from "./governed-geriatric-assessment-engine-adapter";
import type { GovernedGeriatricAssessmentEngineResult } from "./governed-geriatric-assessment-engine";
export type UseGovernedGeriatricAssessmentEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGeriatricAssessmentEngineReadAdapter };
export type UseGovernedGeriatricAssessmentEngineResult = { loading: boolean; error: string | null; result: GovernedGeriatricAssessmentEngineResult | null; refresh: () => void };
export function useGovernedGeriatricAssessmentEngine(options: UseGovernedGeriatricAssessmentEngineOptions): UseGovernedGeriatricAssessmentEngineResult {
  const { sessionId, enabled = true, adapter = governedGeriatricAssessmentEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGeriatricAssessmentEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedGeriatricAssessmentEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
