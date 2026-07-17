/**
 * CI-7 — Hook for Governed Clinical Review (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clinicalReviewReadAdapter,
  type ClinicalReviewReadAdapter,
} from "./review-adapter";
import type { ClinicalReviewResult } from "./review";
import { assertMedicalCopilotSessionId } from "../session-id";

export type UseClinicalReviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReviewReadAdapter;
};

export type UseClinicalReviewResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReviewResult | null;
  refresh: () => void;
};

export function useClinicalReview(
  options: UseClinicalReviewOptions,
): UseClinicalReviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalReviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReviewResult | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const resolvedSessionId = assertMedicalCopilotSessionId(sessionId);
    if (!enabled || !resolvedSessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getClinicalReview(resolvedSessionId)
      .then((next) => {
        if (cancelled) return;
        setResult(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
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
