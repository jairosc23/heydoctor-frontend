"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCalculationValidationEngineReadAdapter, type GovernedCalculationValidationEngineReadAdapter } from "./governed-calculation-validation-engine-adapter";
import type { GovernedCalculationValidationEngineResult } from "./governed-calculation-validation-engine";
export type UseGovernedCalculationValidationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCalculationValidationEngineReadAdapter };
export type UseGovernedCalculationValidationEngineResult = { loading: boolean; error: string | null; result: GovernedCalculationValidationEngineResult | null; refresh: () => void };
export function useGovernedCalculationValidationEngine(options: UseGovernedCalculationValidationEngineOptions): UseGovernedCalculationValidationEngineResult {
  const { sessionId, enabled = true, adapter = governedCalculationValidationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCalculationValidationEngineResult | null>(null);
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
