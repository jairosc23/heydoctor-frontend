"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCentorCalculationEngineReadAdapter, type GovernedCentorCalculationEngineReadAdapter } from "./governed-centor-calculation-engine-adapter";
import type { GovernedCentorCalculationEngineResult } from "./governed-centor-calculation-engine";
export type UseGovernedCentorCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCentorCalculationEngineReadAdapter };
export type UseGovernedCentorCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedCentorCalculationEngineResult | null; refresh: () => void };
export function useGovernedCentorCalculationEngine(options: UseGovernedCentorCalculationEngineOptions): UseGovernedCentorCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedCentorCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCentorCalculationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
