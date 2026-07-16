"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalInterventionPlanningTherapeuticEngineReadAdapter, type GovernedClinicalInterventionPlanningTherapeuticEngineReadAdapter } from "./governed-clinical-intervention-planning-therapeutic-engine-adapter";
import type { GovernedClinicalInterventionPlanningTherapeuticEngineResult } from "./governed-clinical-intervention-planning-therapeutic-engine";
export type UseGovernedClinicalInterventionPlanningTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalInterventionPlanningTherapeuticEngineReadAdapter };
export type UseGovernedClinicalInterventionPlanningTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalInterventionPlanningTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedClinicalInterventionPlanningTherapeuticEngine(options: UseGovernedClinicalInterventionPlanningTherapeuticEngineOptions): UseGovernedClinicalInterventionPlanningTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalInterventionPlanningTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalInterventionPlanningTherapeuticEngineResult | null>(null);
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
