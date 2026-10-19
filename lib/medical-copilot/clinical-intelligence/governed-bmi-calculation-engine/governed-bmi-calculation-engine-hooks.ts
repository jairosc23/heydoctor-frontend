"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedBmiCalculationEngineReadAdapter, type GovernedBmiCalculationEngineReadAdapter } from "./governed-bmi-calculation-engine-adapter";
import type { GovernedBmiCalculationEngineResult } from "./governed-bmi-calculation-engine";
export type UseGovernedBmiCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedBmiCalculationEngineReadAdapter };
export type UseGovernedBmiCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedBmiCalculationEngineResult | null; refresh: () => void };
export function useGovernedBmiCalculationEngine(options: UseGovernedBmiCalculationEngineOptions): UseGovernedBmiCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedBmiCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedBmiCalculationEngineResult | null>(null);
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
