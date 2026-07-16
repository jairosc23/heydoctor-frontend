"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalRiskRuleEngineReadAdapter, type GovernedClinicalRiskRuleEngineReadAdapter } from "./governed-clinical-risk-rule-engine-adapter";
import type { GovernedClinicalRiskRuleEngineResult } from "./governed-clinical-risk-rule-engine";
export type UseGovernedClinicalRiskRuleEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalRiskRuleEngineReadAdapter };
export type UseGovernedClinicalRiskRuleEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalRiskRuleEngineResult | null; refresh: () => void };
export function useGovernedClinicalRiskRuleEngine(options: UseGovernedClinicalRiskRuleEngineOptions): UseGovernedClinicalRiskRuleEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalRiskRuleEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalRiskRuleEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalRiskRuleEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
