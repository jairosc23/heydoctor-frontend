"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalBenchmarkPopulationEngineReadAdapter, type GovernedClinicalBenchmarkPopulationEngineReadAdapter } from "./governed-clinical-benchmark-population-engine-adapter";
import type { GovernedClinicalBenchmarkPopulationEngineResult } from "./governed-clinical-benchmark-population-engine";
export type UseGovernedClinicalBenchmarkPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalBenchmarkPopulationEngineReadAdapter };
export type UseGovernedClinicalBenchmarkPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalBenchmarkPopulationEngineResult | null; refresh: () => void };
export function useGovernedClinicalBenchmarkPopulationEngine(options: UseGovernedClinicalBenchmarkPopulationEngineOptions): UseGovernedClinicalBenchmarkPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalBenchmarkPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalBenchmarkPopulationEngineResult | null>(null);
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
