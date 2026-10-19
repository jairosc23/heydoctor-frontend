"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalRuleEngineRuntimeReadAdapter, type GovernedClinicalRuleEngineRuntimeReadAdapter } from "./governed-clinical-rule-engine-runtime-adapter";
import type { GovernedClinicalRuleEngineRuntimeResult } from "./governed-clinical-rule-engine-runtime";
export type UseGovernedClinicalRuleEngineRuntimeOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalRuleEngineRuntimeReadAdapter };
export type UseGovernedClinicalRuleEngineRuntimeResult = { loading: boolean; error: string | null; result: GovernedClinicalRuleEngineRuntimeResult | null; refresh: () => void };
export function useGovernedClinicalRuleEngineRuntime(options: UseGovernedClinicalRuleEngineRuntimeOptions): UseGovernedClinicalRuleEngineRuntimeResult {
  const { sessionId, enabled = true, adapter = governedClinicalRuleEngineRuntimeReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalRuleEngineRuntimeResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalRuleEngineRuntime(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
