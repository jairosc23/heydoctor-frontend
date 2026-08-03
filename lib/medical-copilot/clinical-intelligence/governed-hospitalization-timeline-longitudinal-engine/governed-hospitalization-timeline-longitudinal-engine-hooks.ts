"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedHospitalizationTimelineLongitudinalEngineReadAdapter, type GovernedHospitalizationTimelineLongitudinalEngineReadAdapter } from "./governed-hospitalization-timeline-longitudinal-engine-adapter";
import type { GovernedHospitalizationTimelineLongitudinalEngineResult } from "./governed-hospitalization-timeline-longitudinal-engine";
export type UseGovernedHospitalizationTimelineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedHospitalizationTimelineLongitudinalEngineReadAdapter };
export type UseGovernedHospitalizationTimelineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedHospitalizationTimelineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedHospitalizationTimelineLongitudinalEngine(options: UseGovernedHospitalizationTimelineLongitudinalEngineOptions): UseGovernedHospitalizationTimelineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedHospitalizationTimelineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedHospitalizationTimelineLongitudinalEngineResult | null>(null);
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
