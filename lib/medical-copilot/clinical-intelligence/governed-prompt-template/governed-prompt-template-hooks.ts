/**
 * AI-8 — Hook for Governed Prompt Template (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  governedPromptTemplateReadAdapter,
  type GovernedPromptTemplateReadAdapter,
} from "./governed-prompt-template-adapter";
import type { GovernedPromptTemplateBuilderResult } from "./governed-prompt-template";

export type UseGovernedPromptTemplateOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPromptTemplateReadAdapter;
};

export type UseGovernedPromptTemplateResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPromptTemplateBuilderResult | null;
  refresh: () => void;
};

export function useGovernedPromptTemplate(
  options: UseGovernedPromptTemplateOptions,
): UseGovernedPromptTemplateResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPromptTemplateReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedPromptTemplateBuilderResult | null>(null);
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
      .getGovernedPromptTemplate(sessionId)
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
