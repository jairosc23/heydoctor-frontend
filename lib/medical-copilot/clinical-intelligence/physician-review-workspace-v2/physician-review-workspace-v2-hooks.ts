"use client";
import { useCallback, useEffect, useState } from "react";
import { reviewWorkspaceV2ReadAdapter, type PhysicianReviewWorkspaceV2ReadAdapter } from "./physician-review-workspace-v2-adapter";
import type { PhysicianReviewWorkspaceV2BuilderResult } from "./physician-review-workspace-v2";

export type UsePhysicianReviewWorkspaceV2Options = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: PhysicianReviewWorkspaceV2ReadAdapter;
};
export type UsePhysicianReviewWorkspaceV2Result = {
  loading: boolean;
  error: string | null;
  result: PhysicianReviewWorkspaceV2BuilderResult | null;
  refresh: () => void;
};

export function usePhysicianReviewWorkspaceV2(options: UsePhysicianReviewWorkspaceV2Options): UsePhysicianReviewWorkspaceV2Result {
  const { sessionId, enabled = true, adapter = reviewWorkspaceV2ReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianReviewWorkspaceV2BuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianReviewWorkspaceV2(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
