"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessConsolidationReadAdapter,
  type GovernedPersistenceReadinessConsolidationReadAdapter,
} from "./governed-persistence-readiness-consolidation-adapter";
import type { GovernedPersistenceReadinessConsolidationResult } from "./governed-persistence-readiness-consolidation";

export type UseGovernedPersistenceReadinessConsolidationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessConsolidationReadAdapter;
};

export type UseGovernedPersistenceReadinessConsolidationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessConsolidationResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessConsolidation(
  options: UseGovernedPersistenceReadinessConsolidationOptions,
): UseGovernedPersistenceReadinessConsolidationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessConsolidationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessConsolidationResult | null>(null);
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
      .getGovernedPersistenceReadinessConsolidation(sessionId)
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
