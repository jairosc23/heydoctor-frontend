"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalOverviewReadAdapter,
  type GovernedClinicalOverviewReadAdapter,
} from "./governed-clinical-overview-adapter";
import type { GovernedClinicalOverviewResult } from "./governed-clinical-overview";

export type UseGovernedClinicalOverviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalOverviewReadAdapter;
};

export type UseGovernedClinicalOverviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalOverviewResult | null;
  refresh: () => void;
};

export function useGovernedClinicalOverview(
  options: UseGovernedClinicalOverviewOptions,
): UseGovernedClinicalOverviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalOverviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalOverviewResult | null>(null);
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
      .getGovernedClinicalOverview(sessionId)
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
