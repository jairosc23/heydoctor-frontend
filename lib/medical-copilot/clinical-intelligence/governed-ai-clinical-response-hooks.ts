/**
 * AI-6 — Hook for Governed AI Clinical Response (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedAIClinicalResponseReadAdapter,
  type GovernedAIClinicalResponseReadAdapter,
} from "./governed-ai-clinical-response-adapter";
import type { GovernedAIClinicalResponseBuilderResult } from "./governed-ai-clinical-response";

export type UseGovernedAIClinicalResponseOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedAIClinicalResponseReadAdapter;
};

export type UseGovernedAIClinicalResponseResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAIClinicalResponseBuilderResult | null;
  refresh: () => void;
};

export function useGovernedAIClinicalResponse(
  options: UseGovernedAIClinicalResponseOptions,
): UseGovernedAIClinicalResponseResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedAIClinicalResponseReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedAIClinicalResponseBuilderResult | null>(null);
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
      .getGovernedAIClinicalResponse(sessionId)
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
