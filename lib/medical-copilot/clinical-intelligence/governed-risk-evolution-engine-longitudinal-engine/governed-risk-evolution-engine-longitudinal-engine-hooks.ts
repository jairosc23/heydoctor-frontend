"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedRiskEvolutionEngineLongitudinalEngineReadAdapter, type GovernedRiskEvolutionEngineLongitudinalEngineReadAdapter } from "./governed-risk-evolution-engine-longitudinal-engine-adapter";
import type { GovernedRiskEvolutionEngineLongitudinalEngineResult } from "./governed-risk-evolution-engine-longitudinal-engine";
export type UseGovernedRiskEvolutionEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRiskEvolutionEngineLongitudinalEngineReadAdapter };
export type UseGovernedRiskEvolutionEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedRiskEvolutionEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedRiskEvolutionEngineLongitudinalEngine(options: UseGovernedRiskEvolutionEngineLongitudinalEngineOptions): UseGovernedRiskEvolutionEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedRiskEvolutionEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRiskEvolutionEngineLongitudinalEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
