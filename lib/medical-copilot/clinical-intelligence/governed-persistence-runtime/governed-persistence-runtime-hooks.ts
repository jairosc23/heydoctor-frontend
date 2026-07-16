"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceRuntimeReadAdapter,
  type GovernedPersistenceRuntimeReadAdapter,
} from "./governed-persistence-runtime-adapter";
import type { GovernedPersistenceRuntimeResult } from "./governed-persistence-runtime";

export type UseGovernedPersistenceRuntimeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceRuntimeReadAdapter;
};

export type UseGovernedPersistenceRuntimeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceRuntimeResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceRuntime(
  options: UseGovernedPersistenceRuntimeOptions,
): UseGovernedPersistenceRuntimeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceRuntimeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceRuntimeResult | null>(null);
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
      .getGovernedPersistenceRuntime(sessionId)
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
