"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedQsofaCalculationEngineReadAdapter, type GovernedQsofaCalculationEngineReadAdapter } from "./governed-qsofa-calculation-engine-adapter";
import type { GovernedQsofaCalculationEngineResult } from "./governed-qsofa-calculation-engine";
export type UseGovernedQsofaCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedQsofaCalculationEngineReadAdapter };
export type UseGovernedQsofaCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedQsofaCalculationEngineResult | null; refresh: () => void };
export function useGovernedQsofaCalculationEngine(options: UseGovernedQsofaCalculationEngineOptions): UseGovernedQsofaCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedQsofaCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedQsofaCalculationEngineResult | null>(null);
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
