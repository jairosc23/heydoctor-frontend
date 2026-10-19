"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPatientTimelineEngineLongitudinalEngineReadAdapter, type GovernedPatientTimelineEngineLongitudinalEngineReadAdapter } from "./governed-patient-timeline-engine-longitudinal-engine-adapter";
import type { GovernedPatientTimelineEngineLongitudinalEngineResult } from "./governed-patient-timeline-engine-longitudinal-engine";
export type UseGovernedPatientTimelineEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPatientTimelineEngineLongitudinalEngineReadAdapter };
export type UseGovernedPatientTimelineEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedPatientTimelineEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedPatientTimelineEngineLongitudinalEngine(options: UseGovernedPatientTimelineEngineLongitudinalEngineOptions): UseGovernedPatientTimelineEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedPatientTimelineEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPatientTimelineEngineLongitudinalEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
