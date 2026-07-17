"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalEvolutionEngineLongitudinalEngineReadAdapter, type GovernedClinicalEvolutionEngineLongitudinalEngineReadAdapter } from "./governed-clinical-evolution-engine-longitudinal-engine-adapter";
import type { GovernedClinicalEvolutionEngineLongitudinalEngineResult } from "./governed-clinical-evolution-engine-longitudinal-engine";
export type UseGovernedClinicalEvolutionEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalEvolutionEngineLongitudinalEngineReadAdapter };
export type UseGovernedClinicalEvolutionEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalEvolutionEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedClinicalEvolutionEngineLongitudinalEngine(options: UseGovernedClinicalEvolutionEngineLongitudinalEngineOptions): UseGovernedClinicalEvolutionEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalEvolutionEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalEvolutionEngineLongitudinalEngineResult | null>(null);
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
