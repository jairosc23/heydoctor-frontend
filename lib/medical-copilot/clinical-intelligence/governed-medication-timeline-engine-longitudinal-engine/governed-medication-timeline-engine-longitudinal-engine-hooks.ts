"use client";
import { useCallback, useEffect, useState } from "react";
import { governedMedicationTimelineEngineLongitudinalEngineReadAdapter, type GovernedMedicationTimelineEngineLongitudinalEngineReadAdapter } from "./governed-medication-timeline-engine-longitudinal-engine-adapter";
import type { GovernedMedicationTimelineEngineLongitudinalEngineResult } from "./governed-medication-timeline-engine-longitudinal-engine";
export type UseGovernedMedicationTimelineEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMedicationTimelineEngineLongitudinalEngineReadAdapter };
export type UseGovernedMedicationTimelineEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedMedicationTimelineEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedMedicationTimelineEngineLongitudinalEngine(options: UseGovernedMedicationTimelineEngineLongitudinalEngineOptions): UseGovernedMedicationTimelineEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedMedicationTimelineEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMedicationTimelineEngineLongitudinalEngineResult | null>(null);
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
