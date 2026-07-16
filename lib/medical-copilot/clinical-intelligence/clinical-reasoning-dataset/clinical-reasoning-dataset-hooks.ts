"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningDatasetReadAdapter, type ClinicalReasoningDatasetReadAdapter } from "./clinical-reasoning-dataset-adapter";
import type { ClinicalReasoningDatasetBuilderResult } from "./clinical-reasoning-dataset";

export type UseClinicalReasoningDatasetOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReasoningDatasetReadAdapter;
};
export type UseClinicalReasoningDatasetResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReasoningDatasetBuilderResult | null;
  refresh: () => void;
};

export function useClinicalReasoningDataset(options: UseClinicalReasoningDatasetOptions): UseClinicalReasoningDatasetResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningDatasetReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningDatasetBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningDataset(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
