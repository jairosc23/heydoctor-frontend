"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedContinuityOfCareEngineLongitudinalEngineReadAdapter, type GovernedContinuityOfCareEngineLongitudinalEngineReadAdapter } from "./governed-continuity-of-care-engine-longitudinal-engine-adapter";
import type { GovernedContinuityOfCareEngineLongitudinalEngineResult } from "./governed-continuity-of-care-engine-longitudinal-engine";
export type UseGovernedContinuityOfCareEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedContinuityOfCareEngineLongitudinalEngineReadAdapter };
export type UseGovernedContinuityOfCareEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedContinuityOfCareEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedContinuityOfCareEngineLongitudinalEngine(options: UseGovernedContinuityOfCareEngineLongitudinalEngineOptions): UseGovernedContinuityOfCareEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedContinuityOfCareEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedContinuityOfCareEngineLongitudinalEngineResult | null>(null);
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
