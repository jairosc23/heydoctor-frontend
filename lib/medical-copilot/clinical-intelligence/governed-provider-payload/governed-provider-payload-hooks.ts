/**
 * AI-10 — Hook for GovernedProviderPayload (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  payloadReadAdapter,
  type GovernedProviderPayloadReadAdapter,
} from "./governed-provider-payload-adapter";
import type { GovernedProviderPayloadBuilderResult } from "./governed-provider-payload";

export type UseGovernedProviderPayloadOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedProviderPayloadReadAdapter;
};

export type UseGovernedProviderPayloadResult = {
  loading: boolean;
  error: string | null;
  result: GovernedProviderPayloadBuilderResult | null;
  refresh: () => void;
};

export function useGovernedProviderPayload(
  options: UseGovernedProviderPayloadOptions,
): UseGovernedProviderPayloadResult {
  const {
    sessionId,
    enabled = true,
    adapter = payloadReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedProviderPayloadBuilderResult | null>(null);
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
      .getGovernedProviderPayload(sessionId)
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
