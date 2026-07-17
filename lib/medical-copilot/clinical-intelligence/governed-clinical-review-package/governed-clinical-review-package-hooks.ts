"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalReviewPackageReadAdapter,
  type GovernedClinicalReviewPackageReadAdapter,
} from "./governed-clinical-review-package-adapter";
import type { GovernedClinicalReviewPackageResult } from "./governed-clinical-review-package";

export type UseGovernedClinicalReviewPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalReviewPackageReadAdapter;
};

export type UseGovernedClinicalReviewPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalReviewPackageResult | null;
  refresh: () => void;
};

export function useGovernedClinicalReviewPackage(
  options: UseGovernedClinicalReviewPackageOptions,
): UseGovernedClinicalReviewPackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalReviewPackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalReviewPackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getGovernedClinicalReviewPackage(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setResult(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
