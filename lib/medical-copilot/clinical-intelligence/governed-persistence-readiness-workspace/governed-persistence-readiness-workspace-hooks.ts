"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessWorkspaceReadAdapter,
  type GovernedPersistenceReadinessWorkspaceReadAdapter,
} from "./governed-persistence-readiness-workspace-adapter";
import type { GovernedPersistenceReadinessWorkspaceResult } from "./governed-persistence-readiness-workspace";

export type UseGovernedPersistenceReadinessWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessWorkspaceReadAdapter;
};

export type UseGovernedPersistenceReadinessWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessWorkspace(
  options: UseGovernedPersistenceReadinessWorkspaceOptions,
): UseGovernedPersistenceReadinessWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessWorkspaceResult | null>(null);
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
      .getGovernedPersistenceReadinessWorkspace(sessionId)
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
