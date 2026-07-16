"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalActivationReviewReadAdapter,
  type GovernedClinicalActivationReviewReadAdapter,
} from "./governed-clinical-activation-review-adapter";
import type { GovernedClinicalActivationReviewResult } from "./governed-clinical-activation-review";

export type UseGovernedClinicalActivationReviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalActivationReviewReadAdapter;
};

export type UseGovernedClinicalActivationReviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalActivationReviewResult | null;
  refresh: () => void;
};

export function useGovernedClinicalActivationReview(
  options: UseGovernedClinicalActivationReviewOptions,
): UseGovernedClinicalActivationReviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalActivationReviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActivationReviewResult | null>(null);
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
      .getGovernedClinicalActivationReview(sessionId)
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
