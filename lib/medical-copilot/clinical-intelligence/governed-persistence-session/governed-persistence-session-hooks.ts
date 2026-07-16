"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceSessionReadAdapter,
  type GovernedPersistenceSessionReadAdapter,
} from "./governed-persistence-session-adapter";
import type { GovernedPersistenceSessionResult } from "./governed-persistence-session";

export type UseGovernedPersistenceSessionOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceSessionReadAdapter;
};

export type UseGovernedPersistenceSessionResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceSessionResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceSession(
  options: UseGovernedPersistenceSessionOptions,
): UseGovernedPersistenceSessionResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceSessionReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceSessionResult | null>(null);
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
      .getGovernedPersistenceSession(sessionId)
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
