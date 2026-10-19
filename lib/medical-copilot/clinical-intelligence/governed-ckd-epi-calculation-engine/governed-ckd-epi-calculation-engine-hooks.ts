"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCkdEpiCalculationEngineReadAdapter, type GovernedCkdEpiCalculationEngineReadAdapter } from "./governed-ckd-epi-calculation-engine-adapter";
import type { GovernedCkdEpiCalculationEngineResult } from "./governed-ckd-epi-calculation-engine";
export type UseGovernedCkdEpiCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCkdEpiCalculationEngineReadAdapter };
export type UseGovernedCkdEpiCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedCkdEpiCalculationEngineResult | null; refresh: () => void };
export function useGovernedCkdEpiCalculationEngine(options: UseGovernedCkdEpiCalculationEngineOptions): UseGovernedCkdEpiCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedCkdEpiCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCkdEpiCalculationEngineResult | null>(null);
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
