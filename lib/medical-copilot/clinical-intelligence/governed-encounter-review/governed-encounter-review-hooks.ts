"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedEncounterReviewReadAdapter,
  type GovernedEncounterReviewReadAdapter,
} from "./governed-encounter-review-adapter";
import type { GovernedEncounterReviewResult } from "./governed-encounter-review";

export type UseGovernedEncounterReviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedEncounterReviewReadAdapter;
};

export type UseGovernedEncounterReviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedEncounterReviewResult | null;
  refresh: () => void;
};

export function useGovernedEncounterReview(
  options: UseGovernedEncounterReviewOptions,
): UseGovernedEncounterReviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedEncounterReviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEncounterReviewResult | null>(null);
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
      .getGovernedEncounterReview(sessionId)
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
