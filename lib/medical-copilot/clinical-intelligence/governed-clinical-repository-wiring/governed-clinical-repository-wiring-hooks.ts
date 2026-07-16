"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalRepositoryWiringReadAdapter,
  type GovernedClinicalRepositoryWiringReadAdapter,
} from "./governed-clinical-repository-wiring-adapter";
import type { GovernedClinicalRepositoryWiringResult } from "./governed-clinical-repository-wiring";

export type UseGovernedClinicalRepositoryWiringOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalRepositoryWiringReadAdapter;
};

export type UseGovernedClinicalRepositoryWiringResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalRepositoryWiringResult | null;
  refresh: () => void;
};

export function useGovernedClinicalRepositoryWiring(
  options: UseGovernedClinicalRepositoryWiringOptions,
): UseGovernedClinicalRepositoryWiringResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalRepositoryWiringReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalRepositoryWiringResult | null>(null);
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
      .getGovernedClinicalRepositoryWiring(sessionId)
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
