/**
 * AI-14 — Hook for GovernedPhysicianReviewPrep (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  reviewPrepReadAdapter,
  type GovernedPhysicianReviewPrepReadAdapter,
} from "./governed-physician-review-prep-adapter";
import type { GovernedPhysicianReviewPrepBuilderResult } from "./governed-physician-review-prep";

export type UseGovernedPhysicianReviewPrepOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianReviewPrepReadAdapter;
};

export type UseGovernedPhysicianReviewPrepResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianReviewPrepBuilderResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianReviewPrep(
  options: UseGovernedPhysicianReviewPrepOptions,
): UseGovernedPhysicianReviewPrepResult {
  const {
    sessionId,
    enabled = true,
    adapter = reviewPrepReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianReviewPrepBuilderResult | null>(null);
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
      .getGovernedPhysicianReviewPrep(sessionId)
      .then((next) => {
        if (cancelled) return;
        setResult(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(toAiClinicalUserMessage(err));
        setResult(null);
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
