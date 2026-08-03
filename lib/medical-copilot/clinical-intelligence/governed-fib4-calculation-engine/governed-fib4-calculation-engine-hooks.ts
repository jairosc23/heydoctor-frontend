"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedFib4CalculationEngineReadAdapter, type GovernedFib4CalculationEngineReadAdapter } from "./governed-fib4-calculation-engine-adapter";
import type { GovernedFib4CalculationEngineResult } from "./governed-fib4-calculation-engine";
export type UseGovernedFib4CalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedFib4CalculationEngineReadAdapter };
export type UseGovernedFib4CalculationEngineResult = { loading: boolean; error: string | null; result: GovernedFib4CalculationEngineResult | null; refresh: () => void };
export function useGovernedFib4CalculationEngine(options: UseGovernedFib4CalculationEngineOptions): UseGovernedFib4CalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedFib4CalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedFib4CalculationEngineResult | null>(null);
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
