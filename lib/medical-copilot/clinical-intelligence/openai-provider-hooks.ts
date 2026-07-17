/**
 * AI-4 — Hook for OpenAI provider diagnostic (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  openAIProviderReadAdapter,
  type OpenAIProviderReadAdapter,
} from "./openai-provider-adapter";
import type { GovernedAIGatewayResult } from "./governed-ai-gateway";

export type UseOpenAIProviderOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: OpenAIProviderReadAdapter;
};

export type UseOpenAIProviderResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAIGatewayResult | null;
  refresh: () => void;
};

export function useOpenAIProvider(
  options: UseOpenAIProviderOptions,
): UseOpenAIProviderResult {
  const {
    sessionId,
    enabled = true,
    adapter = openAIProviderReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAIGatewayResult | null>(null);
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
      .getOpenAIProviderDiagnostic(sessionId)
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
