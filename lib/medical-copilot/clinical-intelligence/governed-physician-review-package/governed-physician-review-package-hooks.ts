"use client";
import { useCallback, useEffect, useState } from "react";
import { physicianReviewPackageReadAdapter, type GovernedPhysicianReviewPackageReadAdapter } from "./governed-physician-review-package-adapter";
import type { GovernedPhysicianReviewPackageBuilderResult } from "./governed-physician-review-package";

export type UseGovernedPhysicianReviewPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianReviewPackageReadAdapter;
};
export type UseGovernedPhysicianReviewPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianReviewPackageBuilderResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianReviewPackage(options: UseGovernedPhysicianReviewPackageOptions): UseGovernedPhysicianReviewPackageResult {
  const { sessionId, enabled = true, adapter = physicianReviewPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianReviewPackageBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPhysicianReviewPackage(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
