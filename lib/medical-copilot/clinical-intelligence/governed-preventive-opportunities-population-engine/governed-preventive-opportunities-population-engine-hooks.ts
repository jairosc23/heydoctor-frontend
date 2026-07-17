"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveOpportunitiesPopulationEngineReadAdapter, type GovernedPreventiveOpportunitiesPopulationEngineReadAdapter } from "./governed-preventive-opportunities-population-engine-adapter";
import type { GovernedPreventiveOpportunitiesPopulationEngineResult } from "./governed-preventive-opportunities-population-engine";
export type UseGovernedPreventiveOpportunitiesPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveOpportunitiesPopulationEngineReadAdapter };
export type UseGovernedPreventiveOpportunitiesPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedPreventiveOpportunitiesPopulationEngineResult | null; refresh: () => void };
export function useGovernedPreventiveOpportunitiesPopulationEngine(options: UseGovernedPreventiveOpportunitiesPopulationEngineOptions): UseGovernedPreventiveOpportunitiesPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedPreventiveOpportunitiesPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveOpportunitiesPopulationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
