"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalSessionDashboardReadAdapter,
  type GovernedClinicalSessionDashboardReadAdapter,
} from "./governed-clinical-session-dashboard-adapter";
import type { GovernedClinicalSessionDashboardResult } from "./governed-clinical-session-dashboard";

export type UseGovernedClinicalSessionDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalSessionDashboardReadAdapter;
};

export type UseGovernedClinicalSessionDashboardResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalSessionDashboardResult | null;
  refresh: () => void;
};

export function useGovernedClinicalSessionDashboard(
  options: UseGovernedClinicalSessionDashboardOptions,
): UseGovernedClinicalSessionDashboardResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalSessionDashboardReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalSessionDashboardResult | null>(null);
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
      .getGovernedClinicalSessionDashboard(sessionId)
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
