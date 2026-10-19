"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationReviewReadAdapter,
  type GovernedConsultationReviewReadAdapter,
} from "./governed-consultation-review-adapter";
import type { GovernedConsultationReviewResult } from "./governed-consultation-review";

export type UseGovernedConsultationReviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationReviewReadAdapter;
};

export type UseGovernedConsultationReviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationReviewResult | null;
  refresh: () => void;
};

export function useGovernedConsultationReview(
  options: UseGovernedConsultationReviewOptions,
): UseGovernedConsultationReviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationReviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationReviewResult | null>(null);
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
      .getGovernedConsultationReview(sessionId)
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
