"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedOttawaKneeRulesCalculationEngineReadAdapter, type GovernedOttawaKneeRulesCalculationEngineReadAdapter } from "./governed-ottawa-knee-rules-calculation-engine-adapter";
import type { GovernedOttawaKneeRulesCalculationEngineResult } from "./governed-ottawa-knee-rules-calculation-engine";
export type UseGovernedOttawaKneeRulesCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedOttawaKneeRulesCalculationEngineReadAdapter };
export type UseGovernedOttawaKneeRulesCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedOttawaKneeRulesCalculationEngineResult | null; refresh: () => void };
export function useGovernedOttawaKneeRulesCalculationEngine(options: UseGovernedOttawaKneeRulesCalculationEngineOptions): UseGovernedOttawaKneeRulesCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedOttawaKneeRulesCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedOttawaKneeRulesCalculationEngineResult | null>(null);
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
