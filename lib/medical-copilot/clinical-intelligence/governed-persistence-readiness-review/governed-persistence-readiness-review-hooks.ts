"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessReviewReadAdapter,
  type GovernedPersistenceReadinessReviewReadAdapter,
} from "./governed-persistence-readiness-review-adapter";
import type { GovernedPersistenceReadinessReviewResult } from "./governed-persistence-readiness-review";

export type UseGovernedPersistenceReadinessReviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessReviewReadAdapter;
};

export type UseGovernedPersistenceReadinessReviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessReviewResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessReview(
  options: UseGovernedPersistenceReadinessReviewOptions,
): UseGovernedPersistenceReadinessReviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessReviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessReviewResult | null>(null);
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
      .getGovernedPersistenceReadinessReview(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
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
