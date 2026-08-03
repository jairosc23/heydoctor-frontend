"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalNavigationReadAdapter,
  type GovernedClinicalNavigationReadAdapter,
} from "./governed-clinical-navigation-adapter";
import type { GovernedClinicalNavigationResult } from "./governed-clinical-navigation";

export type UseGovernedClinicalNavigationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalNavigationReadAdapter;
};

export type UseGovernedClinicalNavigationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalNavigationResult | null;
  refresh: () => void;
};

export function useGovernedClinicalNavigation(
  options: UseGovernedClinicalNavigationOptions,
): UseGovernedClinicalNavigationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalNavigationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalNavigationResult | null>(null);
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
      .getGovernedClinicalNavigation(sessionId)
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
