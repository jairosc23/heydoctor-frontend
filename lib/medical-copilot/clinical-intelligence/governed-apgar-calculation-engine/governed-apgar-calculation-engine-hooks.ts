"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedApgarCalculationEngineReadAdapter, type GovernedApgarCalculationEngineReadAdapter } from "./governed-apgar-calculation-engine-adapter";
import type { GovernedApgarCalculationEngineResult } from "./governed-apgar-calculation-engine";
export type UseGovernedApgarCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedApgarCalculationEngineReadAdapter };
export type UseGovernedApgarCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedApgarCalculationEngineResult | null; refresh: () => void };
export function useGovernedApgarCalculationEngine(options: UseGovernedApgarCalculationEngineOptions): UseGovernedApgarCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedApgarCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedApgarCalculationEngineResult | null>(null);
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
