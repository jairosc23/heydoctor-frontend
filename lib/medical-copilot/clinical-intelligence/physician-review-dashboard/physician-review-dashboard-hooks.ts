"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reviewDashboardReadAdapter, type PhysicianReviewDashboardReadAdapter } from "./physician-review-dashboard-adapter";
import type { PhysicianReviewDashboardBuilderResult } from "./physician-review-dashboard";

export type UsePhysicianReviewDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: PhysicianReviewDashboardReadAdapter;
};
export type UsePhysicianReviewDashboardResult = {
  loading: boolean;
  error: string | null;
  result: PhysicianReviewDashboardBuilderResult | null;
  refresh: () => void;
};

export function usePhysicianReviewDashboard(options: UsePhysicianReviewDashboardOptions): UsePhysicianReviewDashboardResult {
  const { sessionId, enabled = true, adapter = reviewDashboardReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianReviewDashboardBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianReviewDashboard(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
