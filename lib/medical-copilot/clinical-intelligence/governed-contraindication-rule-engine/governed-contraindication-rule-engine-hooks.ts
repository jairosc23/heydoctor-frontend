"use client";
import { useCallback, useEffect, useState } from "react";
import { governedContraindicationRuleEngineReadAdapter, type GovernedContraindicationRuleEngineReadAdapter } from "./governed-contraindication-rule-engine-adapter";
import type { GovernedContraindicationRuleEngineResult } from "./governed-contraindication-rule-engine";
export type UseGovernedContraindicationRuleEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedContraindicationRuleEngineReadAdapter };
export type UseGovernedContraindicationRuleEngineResult = { loading: boolean; error: string | null; result: GovernedContraindicationRuleEngineResult | null; refresh: () => void };
export function useGovernedContraindicationRuleEngine(options: UseGovernedContraindicationRuleEngineOptions): UseGovernedContraindicationRuleEngineResult {
  const { sessionId, enabled = true, adapter = governedContraindicationRuleEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedContraindicationRuleEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedContraindicationRuleEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
