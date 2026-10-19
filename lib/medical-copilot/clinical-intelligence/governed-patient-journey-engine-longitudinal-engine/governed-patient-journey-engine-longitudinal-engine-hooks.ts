"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPatientJourneyEngineLongitudinalEngineReadAdapter, type GovernedPatientJourneyEngineLongitudinalEngineReadAdapter } from "./governed-patient-journey-engine-longitudinal-engine-adapter";
import type { GovernedPatientJourneyEngineLongitudinalEngineResult } from "./governed-patient-journey-engine-longitudinal-engine";
export type UseGovernedPatientJourneyEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPatientJourneyEngineLongitudinalEngineReadAdapter };
export type UseGovernedPatientJourneyEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedPatientJourneyEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedPatientJourneyEngineLongitudinalEngine(options: UseGovernedPatientJourneyEngineLongitudinalEngineOptions): UseGovernedPatientJourneyEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedPatientJourneyEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPatientJourneyEngineLongitudinalEngineResult | null>(null);
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
