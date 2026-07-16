"use client";
import { useCallback, useEffect, useState } from "react";
import { governedVaccinationReviewReadAdapter, type GovernedVaccinationReviewReadAdapter } from "./governed-vaccination-review-adapter";
import type { GovernedVaccinationReviewResult } from "./governed-vaccination-review";

export type UseGovernedVaccinationReviewOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedVaccinationReviewReadAdapter };
export type UseGovernedVaccinationReviewResult = { loading: boolean; error: string | null; result: GovernedVaccinationReviewResult | null; refresh: () => void };

export function useGovernedVaccinationReview(options: UseGovernedVaccinationReviewOptions): UseGovernedVaccinationReviewResult {
  const { sessionId, enabled = true, adapter = governedVaccinationReviewReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedVaccinationReviewResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedVaccinationReview(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
