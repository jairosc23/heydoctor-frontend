/**
 * AI-7 — Hook for Governed AI Prompt (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedAIPromptReadAdapter,
  type GovernedAIPromptReadAdapter,
} from "./governed-ai-prompt-adapter";
import type { GovernedAIPromptBuilderResult } from "./governed-ai-prompt";

export type UseGovernedAIPromptOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedAIPromptReadAdapter;
};

export type UseGovernedAIPromptResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAIPromptBuilderResult | null;
  refresh: () => void;
};

export function useGovernedAIPrompt(
  options: UseGovernedAIPromptOptions,
): UseGovernedAIPromptResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedAIPromptReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAIPromptBuilderResult | null>(
    null,
  );
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
      .getGovernedAIPrompt(sessionId)
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
