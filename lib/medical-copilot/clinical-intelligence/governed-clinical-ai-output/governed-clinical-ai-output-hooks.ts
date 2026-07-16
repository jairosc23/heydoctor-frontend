/**
 * AI-13 — Hook for GovernedClinicalAIOutput (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  outputReadAdapter,
  type GovernedClinicalAIOutputReadAdapter,
} from "./governed-clinical-ai-output-adapter";
import type { GovernedClinicalAIOutputBuilderResult } from "./governed-clinical-ai-output";

export type UseGovernedClinicalAIOutputOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalAIOutputReadAdapter;
};

export type UseGovernedClinicalAIOutputResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalAIOutputBuilderResult | null;
  refresh: () => void;
};

export function useGovernedClinicalAIOutput(
  options: UseGovernedClinicalAIOutputOptions,
): UseGovernedClinicalAIOutputResult {
  const {
    sessionId,
    enabled = true,
    adapter = outputReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAIOutputBuilderResult | null>(null);
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
      .getGovernedClinicalAIOutput(sessionId)
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
