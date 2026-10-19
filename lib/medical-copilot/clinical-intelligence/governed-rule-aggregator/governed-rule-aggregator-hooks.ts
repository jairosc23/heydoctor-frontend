"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedRuleAggregatorReadAdapter, type GovernedRuleAggregatorReadAdapter } from "./governed-rule-aggregator-adapter";
import type { GovernedRuleAggregatorResult } from "./governed-rule-aggregator";
export type UseGovernedRuleAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRuleAggregatorReadAdapter };
export type UseGovernedRuleAggregatorResult = { loading: boolean; error: string | null; result: GovernedRuleAggregatorResult | null; refresh: () => void };
export function useGovernedRuleAggregator(options: UseGovernedRuleAggregatorOptions): UseGovernedRuleAggregatorResult {
  const { sessionId, enabled = true, adapter = governedRuleAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRuleAggregatorResult | null>(null);
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
