"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMeldCalculationEngineReadAdapter, type GovernedMeldCalculationEngineReadAdapter } from "./governed-meld-calculation-engine-adapter";
import type { GovernedMeldCalculationEngineResult } from "./governed-meld-calculation-engine";
export type UseGovernedMeldCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMeldCalculationEngineReadAdapter };
export type UseGovernedMeldCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedMeldCalculationEngineResult | null; refresh: () => void };
export function useGovernedMeldCalculationEngine(options: UseGovernedMeldCalculationEngineOptions): UseGovernedMeldCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedMeldCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMeldCalculationEngineResult | null>(null);
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
