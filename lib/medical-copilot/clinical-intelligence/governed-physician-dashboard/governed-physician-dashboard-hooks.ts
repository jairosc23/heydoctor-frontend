"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPhysicianDashboardReadAdapter,
  type GovernedPhysicianDashboardReadAdapter,
} from "./governed-physician-dashboard-adapter";
import type { GovernedPhysicianDashboardResult } from "./governed-physician-dashboard";

export type UseGovernedPhysicianDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianDashboardReadAdapter;
};

export type UseGovernedPhysicianDashboardResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianDashboardResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianDashboard(
  options: UseGovernedPhysicianDashboardOptions,
): UseGovernedPhysicianDashboardResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPhysicianDashboardReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianDashboardResult | null>(null);
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
      .getGovernedPhysicianDashboard(sessionId)
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
