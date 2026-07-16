"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDecisionQualityEngineReadAdapter, type GovernedDecisionQualityEngineReadAdapter } from "./governed-decision-quality-engine-adapter";
import type { GovernedDecisionQualityEngineResult } from "./governed-decision-quality-engine";
export type UseGovernedDecisionQualityEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDecisionQualityEngineReadAdapter };
export type UseGovernedDecisionQualityEngineResult = { loading: boolean; error: string | null; result: GovernedDecisionQualityEngineResult | null; refresh: () => void };
export function useGovernedDecisionQualityEngine(options: UseGovernedDecisionQualityEngineOptions): UseGovernedDecisionQualityEngineResult {
  const { sessionId, enabled = true, adapter = governedDecisionQualityEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDecisionQualityEngineResult | null>(null);
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
