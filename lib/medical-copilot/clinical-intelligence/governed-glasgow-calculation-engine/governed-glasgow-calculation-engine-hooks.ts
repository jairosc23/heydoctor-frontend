"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedGlasgowCalculationEngineReadAdapter, type GovernedGlasgowCalculationEngineReadAdapter } from "./governed-glasgow-calculation-engine-adapter";
import type { GovernedGlasgowCalculationEngineResult } from "./governed-glasgow-calculation-engine";
export type UseGovernedGlasgowCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGlasgowCalculationEngineReadAdapter };
export type UseGovernedGlasgowCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedGlasgowCalculationEngineResult | null; refresh: () => void };
export function useGovernedGlasgowCalculationEngine(options: UseGovernedGlasgowCalculationEngineOptions): UseGovernedGlasgowCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedGlasgowCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGlasgowCalculationEngineResult | null>(null);
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
