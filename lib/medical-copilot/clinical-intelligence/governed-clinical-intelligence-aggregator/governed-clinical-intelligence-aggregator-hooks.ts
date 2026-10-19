"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalIntelligenceAggregatorReadAdapter, type GovernedClinicalIntelligenceAggregatorReadAdapter } from "./governed-clinical-intelligence-aggregator-adapter";
import type { GovernedClinicalIntelligenceAggregatorResult } from "./governed-clinical-intelligence-aggregator";
export type UseGovernedClinicalIntelligenceAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalIntelligenceAggregatorReadAdapter };
export type UseGovernedClinicalIntelligenceAggregatorResult = { loading: boolean; error: string | null; result: GovernedClinicalIntelligenceAggregatorResult | null; refresh: () => void };
export function useGovernedClinicalIntelligenceAggregator(options: UseGovernedClinicalIntelligenceAggregatorOptions): UseGovernedClinicalIntelligenceAggregatorResult {
  const { sessionId, enabled = true, adapter = governedClinicalIntelligenceAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalIntelligenceAggregatorResult | null>(null);
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
