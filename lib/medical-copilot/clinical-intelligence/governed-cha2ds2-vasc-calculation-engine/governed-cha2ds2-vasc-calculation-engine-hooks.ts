"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCha2ds2VascCalculationEngineReadAdapter, type GovernedCha2ds2VascCalculationEngineReadAdapter } from "./governed-cha2ds2-vasc-calculation-engine-adapter";
import type { GovernedCha2ds2VascCalculationEngineResult } from "./governed-cha2ds2-vasc-calculation-engine";
export type UseGovernedCha2ds2VascCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCha2ds2VascCalculationEngineReadAdapter };
export type UseGovernedCha2ds2VascCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedCha2ds2VascCalculationEngineResult | null; refresh: () => void };
export function useGovernedCha2ds2VascCalculationEngine(options: UseGovernedCha2ds2VascCalculationEngineOptions): UseGovernedCha2ds2VascCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedCha2ds2VascCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCha2ds2VascCalculationEngineResult | null>(null);
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
