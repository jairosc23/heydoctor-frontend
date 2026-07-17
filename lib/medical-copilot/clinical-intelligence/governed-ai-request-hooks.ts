/**
 * AI-1 — Hook for Governed AI Request (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  governedAIRequestReadAdapter,
  type GovernedAIRequestReadAdapter,
} from "./governed-ai-request-adapter";
import type { GovernedAIRequestResult } from "./governed-ai-request";

export type UseGovernedAIRequestOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedAIRequestReadAdapter;
};

export type UseGovernedAIRequestResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAIRequestResult | null;
  refresh: () => void;
};

export function useGovernedAIRequest(
  options: UseGovernedAIRequestOptions,
): UseGovernedAIRequestResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedAIRequestReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAIRequestResult | null>(null);
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
      .getGovernedAIRequest(sessionId)
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
