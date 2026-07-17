/**
 * AI-9 — Hook for GovernedPrompt (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  composedPromptReadAdapter,
  type GovernedPromptReadAdapter,
} from "./governed-prompt-composer-adapter";
import type { GovernedPromptBuilderResult } from "./governed-prompt-composer";

export type UseGovernedPromptOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPromptReadAdapter;
};

export type UseGovernedPromptResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPromptBuilderResult | null;
  refresh: () => void;
};

export function useGovernedPromptComposer(
  options: UseGovernedPromptOptions,
): UseGovernedPromptResult {
  const {
    sessionId,
    enabled = true,
    adapter = composedPromptReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPromptBuilderResult | null>(null);
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
      .getGovernedPromptComposer(sessionId)
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
