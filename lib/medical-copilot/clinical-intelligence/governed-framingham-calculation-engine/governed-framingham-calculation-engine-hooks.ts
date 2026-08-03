"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedFraminghamCalculationEngineReadAdapter, type GovernedFraminghamCalculationEngineReadAdapter } from "./governed-framingham-calculation-engine-adapter";
import type { GovernedFraminghamCalculationEngineResult } from "./governed-framingham-calculation-engine";
export type UseGovernedFraminghamCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedFraminghamCalculationEngineReadAdapter };
export type UseGovernedFraminghamCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedFraminghamCalculationEngineResult | null; refresh: () => void };
export function useGovernedFraminghamCalculationEngine(options: UseGovernedFraminghamCalculationEngineOptions): UseGovernedFraminghamCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedFraminghamCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedFraminghamCalculationEngineResult | null>(null);
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
