/**
 * CI-10 — Hook for Clinical Plan (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clinicalPlanReadAdapter,
  type ClinicalPlanReadAdapter,
} from "./clinical-planning-adapter";
import type { ClinicalPlanResult } from "./clinical-planning";

export type UseClinicalPlanOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalPlanReadAdapter;
};

export type UseClinicalPlanResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalPlanResult | null;
  refresh: () => void;
};

export function useClinicalPlan(
  options: UseClinicalPlanOptions,
): UseClinicalPlanResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalPlanReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalPlanResult | null>(null);
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
      .getClinicalPlan(sessionId)
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
