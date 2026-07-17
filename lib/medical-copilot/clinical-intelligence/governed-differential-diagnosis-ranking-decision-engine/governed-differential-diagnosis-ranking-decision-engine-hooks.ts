"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDifferentialDiagnosisRankingEngineReadAdapter, type GovernedDifferentialDiagnosisRankingEngineReadAdapter } from "./governed-differential-diagnosis-ranking-decision-engine-adapter";
import type { GovernedDifferentialDiagnosisRankingEngineResult } from "./governed-differential-diagnosis-ranking-decision-engine";
export type UseGovernedDifferentialDiagnosisRankingEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDifferentialDiagnosisRankingEngineReadAdapter };
export type UseGovernedDifferentialDiagnosisRankingEngineResult = { loading: boolean; error: string | null; result: GovernedDifferentialDiagnosisRankingEngineResult | null; refresh: () => void };
export function useGovernedDifferentialDiagnosisRankingEngine(options: UseGovernedDifferentialDiagnosisRankingEngineOptions): UseGovernedDifferentialDiagnosisRankingEngineResult {
  const { sessionId, enabled = true, adapter = governedDifferentialDiagnosisRankingEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDifferentialDiagnosisRankingEngineResult | null>(null);
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
