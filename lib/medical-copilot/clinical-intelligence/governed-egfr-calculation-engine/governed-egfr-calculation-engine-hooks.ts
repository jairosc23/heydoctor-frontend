"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEgfrCalculationEngineReadAdapter, type GovernedEgfrCalculationEngineReadAdapter } from "./governed-egfr-calculation-engine-adapter";
import type { GovernedEgfrCalculationEngineResult } from "./governed-egfr-calculation-engine";
export type UseGovernedEgfrCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEgfrCalculationEngineReadAdapter };
export type UseGovernedEgfrCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedEgfrCalculationEngineResult | null; refresh: () => void };
export function useGovernedEgfrCalculationEngine(options: UseGovernedEgfrCalculationEngineOptions): UseGovernedEgfrCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedEgfrCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEgfrCalculationEngineResult | null>(null);
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
