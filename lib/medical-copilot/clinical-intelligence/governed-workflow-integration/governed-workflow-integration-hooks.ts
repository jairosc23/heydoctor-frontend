/**
 * AI-15 — Hook for GovernedWorkflowIntegration (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  integrationReadAdapter,
  type GovernedWorkflowIntegrationReadAdapter,
} from "./governed-workflow-integration-adapter";
import type { GovernedWorkflowIntegrationBuilderResult } from "./governed-workflow-integration";

export type UseGovernedWorkflowIntegrationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedWorkflowIntegrationReadAdapter;
};

export type UseGovernedWorkflowIntegrationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedWorkflowIntegrationBuilderResult | null;
  refresh: () => void;
};

export function useGovernedWorkflowIntegration(
  options: UseGovernedWorkflowIntegrationOptions,
): UseGovernedWorkflowIntegrationResult {
  const {
    sessionId,
    enabled = true,
    adapter = integrationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedWorkflowIntegrationBuilderResult | null>(null);
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
      .getGovernedWorkflowIntegration(sessionId)
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
