"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedWellsPeCalculationEngineReadAdapter, type GovernedWellsPeCalculationEngineReadAdapter } from "./governed-wells-pe-calculation-engine-adapter";
import type { GovernedWellsPeCalculationEngineResult } from "./governed-wells-pe-calculation-engine";
export type UseGovernedWellsPeCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedWellsPeCalculationEngineReadAdapter };
export type UseGovernedWellsPeCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedWellsPeCalculationEngineResult | null; refresh: () => void };
export function useGovernedWellsPeCalculationEngine(options: UseGovernedWellsPeCalculationEngineOptions): UseGovernedWellsPeCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedWellsPeCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedWellsPeCalculationEngineResult | null>(null);
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
