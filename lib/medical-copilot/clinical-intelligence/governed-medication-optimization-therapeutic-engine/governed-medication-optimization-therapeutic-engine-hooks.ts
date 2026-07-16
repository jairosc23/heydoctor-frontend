"use client";
import { useCallback, useEffect, useState } from "react";
import { governedMedicationOptimizationTherapeuticEngineReadAdapter, type GovernedMedicationOptimizationTherapeuticEngineReadAdapter } from "./governed-medication-optimization-therapeutic-engine-adapter";
import type { GovernedMedicationOptimizationTherapeuticEngineResult } from "./governed-medication-optimization-therapeutic-engine";
export type UseGovernedMedicationOptimizationTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMedicationOptimizationTherapeuticEngineReadAdapter };
export type UseGovernedMedicationOptimizationTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedMedicationOptimizationTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedMedicationOptimizationTherapeuticEngine(options: UseGovernedMedicationOptimizationTherapeuticEngineOptions): UseGovernedMedicationOptimizationTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedMedicationOptimizationTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMedicationOptimizationTherapeuticEngineResult | null>(null);
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
