"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalContextStageReadAdapter, type GovernedClinicalContextStageReadAdapter } from "./governed-clinical-context-stage-adapter";
import type { GovernedClinicalContextStageResult } from "./governed-clinical-context-stage";
export type UseGovernedClinicalContextStageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalContextStageReadAdapter };
export type UseGovernedClinicalContextStageResult = { loading: boolean; error: string | null; result: GovernedClinicalContextStageResult | null; refresh: () => void };
export function useGovernedClinicalContextStage(options: UseGovernedClinicalContextStageOptions): UseGovernedClinicalContextStageResult {
  const { sessionId, enabled = true, adapter = governedClinicalContextStageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalContextStageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalContextStage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
