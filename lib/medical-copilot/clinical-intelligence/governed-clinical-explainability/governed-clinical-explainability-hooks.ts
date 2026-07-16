"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalExplainabilityReadAdapter, type GovernedClinicalExplainabilityReadAdapter } from "./governed-clinical-explainability-adapter";
import type { GovernedClinicalExplainabilityResult } from "./governed-clinical-explainability";

export type UseGovernedClinicalExplainabilityOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalExplainabilityReadAdapter };
export type UseGovernedClinicalExplainabilityResult = { loading: boolean; error: string | null; result: GovernedClinicalExplainabilityResult | null; refresh: () => void };

export function useGovernedClinicalExplainability(options: UseGovernedClinicalExplainabilityOptions): UseGovernedClinicalExplainabilityResult {
  const { sessionId, enabled = true, adapter = governedClinicalExplainabilityReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalExplainabilityResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalExplainability(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
