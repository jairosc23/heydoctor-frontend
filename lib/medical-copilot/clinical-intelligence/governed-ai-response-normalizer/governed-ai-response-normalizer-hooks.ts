/**
 * AI-12 — Hook for GovernedNormalizedAIResponse (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  normalizedReadAdapter,
  type GovernedNormalizedAIResponseReadAdapter,
} from "./governed-ai-response-normalizer-adapter";
import type { GovernedNormalizedAIResponseBuilderResult } from "./governed-ai-response-normalizer";

export type UseGovernedNormalizedAIResponseOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedNormalizedAIResponseReadAdapter;
};

export type UseGovernedNormalizedAIResponseResult = {
  loading: boolean;
  error: string | null;
  result: GovernedNormalizedAIResponseBuilderResult | null;
  refresh: () => void;
};

export function useGovernedAIResponseNormalizer(
  options: UseGovernedNormalizedAIResponseOptions,
): UseGovernedNormalizedAIResponseResult {
  const {
    sessionId,
    enabled = true,
    adapter = normalizedReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedNormalizedAIResponseBuilderResult | null>(null);
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
      .getGovernedAIResponseNormalizer(sessionId)
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
