"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReviewReadAdapter,
  type GovernedPersistenceReviewReadAdapter,
} from "./governed-persistence-review-adapter";
import type { GovernedPersistenceReviewResult } from "./governed-persistence-review";

export type UseGovernedPersistenceReviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReviewReadAdapter;
};

export type UseGovernedPersistenceReviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReviewResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReview(
  options: UseGovernedPersistenceReviewOptions,
): UseGovernedPersistenceReviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReviewResult | null>(null);
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
      .getGovernedPersistenceReview(sessionId)
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
