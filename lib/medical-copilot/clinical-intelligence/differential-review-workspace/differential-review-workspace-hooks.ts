"use client";
import { useCallback, useEffect, useState } from "react";
import { differentialReviewReadAdapter, type DifferentialReviewWorkspaceReadAdapter } from "./differential-review-workspace-adapter";
import type { DifferentialReviewWorkspaceBuilderResult } from "./differential-review-workspace";

export type UseDifferentialReviewWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: DifferentialReviewWorkspaceReadAdapter;
};
export type UseDifferentialReviewWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: DifferentialReviewWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useDifferentialReviewWorkspace(options: UseDifferentialReviewWorkspaceOptions): UseDifferentialReviewWorkspaceResult {
  const { sessionId, enabled = true, adapter = differentialReviewReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DifferentialReviewWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getDifferentialReviewWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
