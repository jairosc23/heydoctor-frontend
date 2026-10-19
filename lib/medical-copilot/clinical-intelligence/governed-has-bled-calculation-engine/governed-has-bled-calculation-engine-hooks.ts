"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedHasBledCalculationEngineReadAdapter, type GovernedHasBledCalculationEngineReadAdapter } from "./governed-has-bled-calculation-engine-adapter";
import type { GovernedHasBledCalculationEngineResult } from "./governed-has-bled-calculation-engine";
export type UseGovernedHasBledCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedHasBledCalculationEngineReadAdapter };
export type UseGovernedHasBledCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedHasBledCalculationEngineResult | null; refresh: () => void };
export function useGovernedHasBledCalculationEngine(options: UseGovernedHasBledCalculationEngineOptions): UseGovernedHasBledCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedHasBledCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedHasBledCalculationEngineResult | null>(null);
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
