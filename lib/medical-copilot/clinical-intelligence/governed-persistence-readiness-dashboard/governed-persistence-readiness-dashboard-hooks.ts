"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessDashboardReadAdapter,
  type GovernedPersistenceReadinessDashboardReadAdapter,
} from "./governed-persistence-readiness-dashboard-adapter";
import type { GovernedPersistenceReadinessDashboardResult } from "./governed-persistence-readiness-dashboard";

export type UseGovernedPersistenceReadinessDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessDashboardReadAdapter;
};

export type UseGovernedPersistenceReadinessDashboardResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessDashboardResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessDashboard(
  options: UseGovernedPersistenceReadinessDashboardOptions,
): UseGovernedPersistenceReadinessDashboardResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessDashboardReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessDashboardResult | null>(null);
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
      .getGovernedPersistenceReadinessDashboard(sessionId)
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
