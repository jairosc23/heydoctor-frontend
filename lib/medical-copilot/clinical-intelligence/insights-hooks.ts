/**
 * CI-2 — Hook for Clinical Insights (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  clinicalInsightsReadAdapter,
  type ClinicalInsightsReadAdapter,
} from "./insights-adapter";
import type { ClinicalInsightResult } from "./insights";

export type UseClinicalInsightsOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalInsightsReadAdapter;
};

export type UseClinicalInsightsResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalInsightResult | null;
  refresh: () => void;
};

export function useClinicalInsights(
  options: UseClinicalInsightsOptions,
): UseClinicalInsightsResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalInsightsReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalInsightResult | null>(null);
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
      .getClinicalInsights(sessionId)
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
