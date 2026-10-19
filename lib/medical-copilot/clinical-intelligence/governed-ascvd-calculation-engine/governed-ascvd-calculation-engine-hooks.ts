"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedAscvdCalculationEngineReadAdapter, type GovernedAscvdCalculationEngineReadAdapter } from "./governed-ascvd-calculation-engine-adapter";
import type { GovernedAscvdCalculationEngineResult } from "./governed-ascvd-calculation-engine";
export type UseGovernedAscvdCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAscvdCalculationEngineReadAdapter };
export type UseGovernedAscvdCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedAscvdCalculationEngineResult | null; refresh: () => void };
export function useGovernedAscvdCalculationEngine(options: UseGovernedAscvdCalculationEngineOptions): UseGovernedAscvdCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedAscvdCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAscvdCalculationEngineResult | null>(null);
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
