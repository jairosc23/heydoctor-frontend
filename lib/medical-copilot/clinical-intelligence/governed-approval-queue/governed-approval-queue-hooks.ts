"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedApprovalQueueReadAdapter,
  type GovernedApprovalQueueReadAdapter,
} from "./governed-approval-queue-adapter";
import type { GovernedApprovalQueueResult } from "./governed-approval-queue";

export type UseGovernedApprovalQueueOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedApprovalQueueReadAdapter;
};

export type UseGovernedApprovalQueueResult = {
  loading: boolean;
  error: string | null;
  result: GovernedApprovalQueueResult | null;
  refresh: () => void;
};

export function useGovernedApprovalQueue(
  options: UseGovernedApprovalQueueOptions,
): UseGovernedApprovalQueueResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedApprovalQueueReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedApprovalQueueResult | null>(null);
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
      .getGovernedApprovalQueue(sessionId)
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
