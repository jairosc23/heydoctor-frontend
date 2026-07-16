"use client";
import { useCallback, useEffect, useState } from "react";
import { governedOttawaAnkleRulesCalculationEngineReadAdapter, type GovernedOttawaAnkleRulesCalculationEngineReadAdapter } from "./governed-ottawa-ankle-rules-calculation-engine-adapter";
import type { GovernedOttawaAnkleRulesCalculationEngineResult } from "./governed-ottawa-ankle-rules-calculation-engine";
export type UseGovernedOttawaAnkleRulesCalculationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedOttawaAnkleRulesCalculationEngineReadAdapter };
export type UseGovernedOttawaAnkleRulesCalculationEngineResult = { loading: boolean; error: string | null; result: GovernedOttawaAnkleRulesCalculationEngineResult | null; refresh: () => void };
export function useGovernedOttawaAnkleRulesCalculationEngine(options: UseGovernedOttawaAnkleRulesCalculationEngineOptions): UseGovernedOttawaAnkleRulesCalculationEngineResult {
  const { sessionId, enabled = true, adapter = governedOttawaAnkleRulesCalculationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedOttawaAnkleRulesCalculationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
