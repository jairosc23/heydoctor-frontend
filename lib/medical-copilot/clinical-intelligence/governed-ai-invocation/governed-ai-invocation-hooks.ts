/**
 * AI-11 — Hook for GovernedAIInvocationResult (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  invocationReadAdapter,
  type GovernedAIInvocationResultReadAdapter,
} from "./governed-ai-invocation-adapter";
import type { GovernedAIInvocationResultBuilderResult } from "./governed-ai-invocation";

export type UseGovernedAIInvocationResultOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedAIInvocationResultReadAdapter;
};

export type UseGovernedAIInvocationResultResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAIInvocationResultBuilderResult | null;
  refresh: () => void;
};

export function useGovernedAIInvocation(
  options: UseGovernedAIInvocationResultOptions,
): UseGovernedAIInvocationResultResult {
  const {
    sessionId,
    enabled = true,
    adapter = invocationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAIInvocationResultBuilderResult | null>(null);
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
      .getGovernedAIInvocation(sessionId)
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
