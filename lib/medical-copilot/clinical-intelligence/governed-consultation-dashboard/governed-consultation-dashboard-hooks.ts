"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationDashboardReadAdapter,
  type GovernedConsultationDashboardReadAdapter,
} from "./governed-consultation-dashboard-adapter";
import type { GovernedConsultationDashboardResult } from "./governed-consultation-dashboard";

export type UseGovernedConsultationDashboardOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationDashboardReadAdapter;
};

export type UseGovernedConsultationDashboardResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationDashboardResult | null;
  refresh: () => void;
};

export function useGovernedConsultationDashboard(
  options: UseGovernedConsultationDashboardOptions,
): UseGovernedConsultationDashboardResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationDashboardReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationDashboardResult | null>(null);
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
      .getGovernedConsultationDashboard(sessionId)
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
