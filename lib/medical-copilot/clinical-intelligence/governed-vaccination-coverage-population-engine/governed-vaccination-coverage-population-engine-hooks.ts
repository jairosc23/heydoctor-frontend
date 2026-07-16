"use client";
import { useCallback, useEffect, useState } from "react";
import { governedVaccinationCoveragePopulationEngineReadAdapter, type GovernedVaccinationCoveragePopulationEngineReadAdapter } from "./governed-vaccination-coverage-population-engine-adapter";
import type { GovernedVaccinationCoveragePopulationEngineResult } from "./governed-vaccination-coverage-population-engine";
export type UseGovernedVaccinationCoveragePopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedVaccinationCoveragePopulationEngineReadAdapter };
export type UseGovernedVaccinationCoveragePopulationEngineResult = { loading: boolean; error: string | null; result: GovernedVaccinationCoveragePopulationEngineResult | null; refresh: () => void };
export function useGovernedVaccinationCoveragePopulationEngine(options: UseGovernedVaccinationCoveragePopulationEngineOptions): UseGovernedVaccinationCoveragePopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedVaccinationCoveragePopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedVaccinationCoveragePopulationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
