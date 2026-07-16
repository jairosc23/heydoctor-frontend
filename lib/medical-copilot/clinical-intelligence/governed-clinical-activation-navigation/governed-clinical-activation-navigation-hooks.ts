"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalActivationNavigationReadAdapter,
  type GovernedClinicalActivationNavigationReadAdapter,
} from "./governed-clinical-activation-navigation-adapter";
import type { GovernedClinicalActivationNavigationResult } from "./governed-clinical-activation-navigation";

export type UseGovernedClinicalActivationNavigationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalActivationNavigationReadAdapter;
};

export type UseGovernedClinicalActivationNavigationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalActivationNavigationResult | null;
  refresh: () => void;
};

export function useGovernedClinicalActivationNavigation(
  options: UseGovernedClinicalActivationNavigationOptions,
): UseGovernedClinicalActivationNavigationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalActivationNavigationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActivationNavigationResult | null>(null);
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
      .getGovernedClinicalActivationNavigation(sessionId)
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
