/**
 * AI-3 — Hook for Governed AI Gateway (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedAIGatewayReadAdapter,
  type GovernedAIGatewayReadAdapter,
} from "./governed-ai-gateway-adapter";
import type { GovernedAIGatewayResult } from "./governed-ai-gateway";

export type UseGovernedAIGatewayOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedAIGatewayReadAdapter;
};

export type UseGovernedAIGatewayResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAIGatewayResult | null;
  refresh: () => void;
};

export function useGovernedAIGateway(
  options: UseGovernedAIGatewayOptions,
): UseGovernedAIGatewayResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedAIGatewayReadAdapter,
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
      .getGovernedAIGateway(sessionId)
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
