"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedAllergyRuleEngineReadAdapter, type GovernedAllergyRuleEngineReadAdapter } from "./governed-allergy-rule-engine-adapter";
import type { GovernedAllergyRuleEngineResult } from "./governed-allergy-rule-engine";
export type UseGovernedAllergyRuleEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAllergyRuleEngineReadAdapter };
export type UseGovernedAllergyRuleEngineResult = { loading: boolean; error: string | null; result: GovernedAllergyRuleEngineResult | null; refresh: () => void };
export function useGovernedAllergyRuleEngine(options: UseGovernedAllergyRuleEngineOptions): UseGovernedAllergyRuleEngineResult {
  const { sessionId, enabled = true, adapter = governedAllergyRuleEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAllergyRuleEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedAllergyRuleEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
