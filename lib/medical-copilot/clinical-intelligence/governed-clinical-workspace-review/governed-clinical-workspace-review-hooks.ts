"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalWorkspaceReviewReadAdapter,
  type GovernedClinicalWorkspaceReviewReadAdapter,
} from "./governed-clinical-workspace-review-adapter";
import type { GovernedClinicalWorkspaceReviewResult } from "./governed-clinical-workspace-review";

export type UseGovernedClinicalWorkspaceReviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalWorkspaceReviewReadAdapter;
};

export type UseGovernedClinicalWorkspaceReviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalWorkspaceReviewResult | null;
  refresh: () => void;
};

export function useGovernedClinicalWorkspaceReview(
  options: UseGovernedClinicalWorkspaceReviewOptions,
): UseGovernedClinicalWorkspaceReviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalWorkspaceReviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalWorkspaceReviewResult | null>(null);
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
      .getGovernedClinicalWorkspaceReview(sessionId)
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
