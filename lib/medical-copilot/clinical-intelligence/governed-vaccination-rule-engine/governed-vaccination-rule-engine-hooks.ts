"use client";
import { useCallback, useEffect, useState } from "react";
import { governedVaccinationRuleEngineReadAdapter, type GovernedVaccinationRuleEngineReadAdapter } from "./governed-vaccination-rule-engine-adapter";
import type { GovernedVaccinationRuleEngineResult } from "./governed-vaccination-rule-engine";
export type UseGovernedVaccinationRuleEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedVaccinationRuleEngineReadAdapter };
export type UseGovernedVaccinationRuleEngineResult = { loading: boolean; error: string | null; result: GovernedVaccinationRuleEngineResult | null; refresh: () => void };
export function useGovernedVaccinationRuleEngine(options: UseGovernedVaccinationRuleEngineOptions): UseGovernedVaccinationRuleEngineResult {
  const { sessionId, enabled = true, adapter = governedVaccinationRuleEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedVaccinationRuleEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedVaccinationRuleEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
