"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceAggregatorReadAdapter, type GovernedEvidenceAggregatorReadAdapter } from "./governed-evidence-aggregator-adapter";
import type { GovernedEvidenceAggregatorResult } from "./governed-evidence-aggregator";
export type UseGovernedEvidenceAggregatorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceAggregatorReadAdapter };
export type UseGovernedEvidenceAggregatorResult = { loading: boolean; error: string | null; result: GovernedEvidenceAggregatorResult | null; refresh: () => void };
export function useGovernedEvidenceAggregator(options: UseGovernedEvidenceAggregatorOptions): UseGovernedEvidenceAggregatorResult {
  const { sessionId, enabled = true, adapter = governedEvidenceAggregatorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceAggregatorResult | null>(null);
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
