"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalReasoningDatasetReadAdapter, type GovernedClinicalReasoningDatasetReadAdapter } from "./governed-clinical-reasoning-dataset-adapter";
import type { GovernedClinicalReasoningDatasetBuilderResult } from "./governed-clinical-reasoning-dataset";

export type UseGovernedClinicalReasoningDatasetOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalReasoningDatasetReadAdapter;
};
export type UseGovernedClinicalReasoningDatasetResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalReasoningDatasetBuilderResult | null;
  refresh: () => void;
};

export function useGovernedClinicalReasoningDataset(options: UseGovernedClinicalReasoningDatasetOptions): UseGovernedClinicalReasoningDatasetResult {
  const { sessionId, enabled = true, adapter = governedClinicalReasoningDatasetReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalReasoningDatasetBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalReasoningDataset(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
