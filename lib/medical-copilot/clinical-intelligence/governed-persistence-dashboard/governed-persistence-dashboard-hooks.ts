"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceDashboardReadAdapter,
  type GovernedPersistenceDashboardReadAdapter,
} from "./governed-persistence-dashboard-adapter";
import type { GovernedPersistenceDashboardResult } from "./governed-persistence-dashboard";

export type UseGovernedPersistenceDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceDashboardReadAdapter;
};

export type UseGovernedPersistenceDashboardResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceDashboardResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceDashboard(
  options: UseGovernedPersistenceDashboardOptions,
): UseGovernedPersistenceDashboardResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceDashboardReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceDashboardResult | null>(null);
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
      .getGovernedPersistenceDashboard(sessionId)
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
