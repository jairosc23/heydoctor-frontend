/**
 * AI-2 — Hook for AI Provider Route (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  aiProviderRouteReadAdapter,
  type AIProviderRouteReadAdapter,
} from "./ai-provider-adapter";
import type { AIProviderRouteResult } from "./ai-provider";

export type UseAIProviderRouteOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: AIProviderRouteReadAdapter;
};

export type UseAIProviderRouteResult = {
  loading: boolean;
  error: string | null;
  result: AIProviderRouteResult | null;
  refresh: () => void;
};

export function useAIProviderRoute(
  options: UseAIProviderRouteOptions,
): UseAIProviderRouteResult {
  const {
    sessionId,
    enabled = true,
    adapter = aiProviderRouteReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIProviderRouteResult | null>(null);
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
      .getAIProviderRoute(sessionId)
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
