"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPendingActionsReadAdapter,
  type GovernedPendingActionsReadAdapter,
} from "./governed-pending-actions-adapter";
import type { GovernedPendingActionsResult } from "./governed-pending-actions";

export type UseGovernedPendingActionsOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPendingActionsReadAdapter;
};

export type UseGovernedPendingActionsResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPendingActionsResult | null;
  refresh: () => void;
};

export function useGovernedPendingActions(
  options: UseGovernedPendingActionsOptions,
): UseGovernedPendingActionsResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPendingActionsReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPendingActionsResult | null>(null);
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
      .getGovernedPendingActions(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setResult(null);
        }
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
