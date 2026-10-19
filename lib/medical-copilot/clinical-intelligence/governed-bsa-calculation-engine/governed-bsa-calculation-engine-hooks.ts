"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedBsaCalculationEngineReadAdapter, type GovernedBsaCalculationEngineReadAdapter } from "./governed-bsa-calculation-engine-adapter";
import type { GovernedBsaCalculationEngineResult } from "./governed-bsa-calculation-engine";
export type UseGovernedBsaCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedBsaCalculationEngineReadAdapter };
export type UseGovernedBsaCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedBsaCalculationEngineResult | null; refresh: () => void };
export function useGovernedBsaCalculationEngine(options: UseGovernedBsaCalculationEngineOptions): UseGovernedBsaCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedBsaCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedBsaCalculationEngineResult | null>(null);
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
