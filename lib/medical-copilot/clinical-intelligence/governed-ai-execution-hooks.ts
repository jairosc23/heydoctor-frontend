/**
 * AI-5 — Hook for Governed AI Execution Engine (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedAIExecutionReadAdapter,
  type GovernedAIExecutionReadAdapter,
} from "./governed-ai-execution-adapter";
import type { GovernedAIExecutionEngineResult } from "./governed-ai-execution";

export type UseGovernedAIExecutionOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedAIExecutionReadAdapter;
};

export type UseGovernedAIExecutionResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAIExecutionEngineResult | null;
  refresh: () => void;
};

export function useGovernedAIExecution(
  options: UseGovernedAIExecutionOptions,
): UseGovernedAIExecutionResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedAIExecutionReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAIExecutionEngineResult | null>(
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
      .getGovernedAIExecution(sessionId)
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
