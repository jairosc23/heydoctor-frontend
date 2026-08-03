"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveCareRuleEngineReadAdapter, type GovernedPreventiveCareRuleEngineReadAdapter } from "./governed-preventive-care-rule-engine-adapter";
import type { GovernedPreventiveCareRuleEngineResult } from "./governed-preventive-care-rule-engine";
export type UseGovernedPreventiveCareRuleEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveCareRuleEngineReadAdapter };
export type UseGovernedPreventiveCareRuleEngineResult = { loading: boolean; error: string | null; result: GovernedPreventiveCareRuleEngineResult | null; refresh: () => void };
export function useGovernedPreventiveCareRuleEngine(options: UseGovernedPreventiveCareRuleEngineOptions): UseGovernedPreventiveCareRuleEngineResult {
  const { sessionId, enabled = true, adapter = governedPreventiveCareRuleEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveCareRuleEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPreventiveCareRuleEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
