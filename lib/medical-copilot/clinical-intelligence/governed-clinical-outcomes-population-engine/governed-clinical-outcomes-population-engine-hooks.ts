"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalOutcomesPopulationEngineReadAdapter, type GovernedClinicalOutcomesPopulationEngineReadAdapter } from "./governed-clinical-outcomes-population-engine-adapter";
import type { GovernedClinicalOutcomesPopulationEngineResult } from "./governed-clinical-outcomes-population-engine";
export type UseGovernedClinicalOutcomesPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalOutcomesPopulationEngineReadAdapter };
export type UseGovernedClinicalOutcomesPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalOutcomesPopulationEngineResult | null; refresh: () => void };
export function useGovernedClinicalOutcomesPopulationEngine(options: UseGovernedClinicalOutcomesPopulationEngineOptions): UseGovernedClinicalOutcomesPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalOutcomesPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalOutcomesPopulationEngineResult | null>(null);
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
