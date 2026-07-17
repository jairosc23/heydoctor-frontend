"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessRuntimeReadAdapter,
  type GovernedPersistenceReadinessRuntimeReadAdapter,
} from "./governed-persistence-readiness-runtime-adapter";
import type { GovernedPersistenceReadinessRuntimeResult } from "./governed-persistence-readiness-runtime";

export type UseGovernedPersistenceReadinessRuntimeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessRuntimeReadAdapter;
};

export type UseGovernedPersistenceReadinessRuntimeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessRuntimeResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessRuntime(
  options: UseGovernedPersistenceReadinessRuntimeOptions,
): UseGovernedPersistenceReadinessRuntimeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessRuntimeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessRuntimeResult | null>(null);
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
      .getGovernedPersistenceReadinessRuntime(sessionId)
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
