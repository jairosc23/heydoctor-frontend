"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedVaccinationTimelineLongitudinalEngineReadAdapter, type GovernedVaccinationTimelineLongitudinalEngineReadAdapter } from "./governed-vaccination-timeline-longitudinal-engine-adapter";
import type { GovernedVaccinationTimelineLongitudinalEngineResult } from "./governed-vaccination-timeline-longitudinal-engine";
export type UseGovernedVaccinationTimelineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedVaccinationTimelineLongitudinalEngineReadAdapter };
export type UseGovernedVaccinationTimelineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedVaccinationTimelineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedVaccinationTimelineLongitudinalEngine(options: UseGovernedVaccinationTimelineLongitudinalEngineOptions): UseGovernedVaccinationTimelineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedVaccinationTimelineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedVaccinationTimelineLongitudinalEngineResult | null>(null);
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
