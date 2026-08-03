"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalActivationDashboardReadAdapter,
  type GovernedClinicalActivationDashboardReadAdapter,
} from "./governed-clinical-activation-dashboard-adapter";
import type { GovernedClinicalActivationDashboardResult } from "./governed-clinical-activation-dashboard";

export type UseGovernedClinicalActivationDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalActivationDashboardReadAdapter;
};

export type UseGovernedClinicalActivationDashboardResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalActivationDashboardResult | null;
  refresh: () => void;
};

export function useGovernedClinicalActivationDashboard(
  options: UseGovernedClinicalActivationDashboardOptions,
): UseGovernedClinicalActivationDashboardResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalActivationDashboardReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActivationDashboardResult | null>(null);
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
      .getGovernedClinicalActivationDashboard(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
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
