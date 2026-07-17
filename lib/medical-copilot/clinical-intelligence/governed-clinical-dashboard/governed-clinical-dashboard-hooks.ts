"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalDashboardReadAdapter,
  type GovernedClinicalDashboardReadAdapter,
} from "./governed-clinical-dashboard-adapter";
import type { GovernedClinicalDashboardResult } from "./governed-clinical-dashboard";

export type UseGovernedClinicalDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalDashboardReadAdapter;
};

export type UseGovernedClinicalDashboardResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalDashboardResult | null;
  refresh: () => void;
};

export function useGovernedClinicalDashboard(
  options: UseGovernedClinicalDashboardOptions,
): UseGovernedClinicalDashboardResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalDashboardReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDashboardResult | null>(null);
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
      .getGovernedClinicalDashboard(sessionId)
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
