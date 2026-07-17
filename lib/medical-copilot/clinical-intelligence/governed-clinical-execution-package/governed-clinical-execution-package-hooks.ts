"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalExecutionPackageReadAdapter,
  type GovernedClinicalExecutionPackageReadAdapter,
} from "./governed-clinical-execution-package-adapter";
import type { GovernedClinicalExecutionPackageResult } from "./governed-clinical-execution-package";

export type UseGovernedClinicalExecutionPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalExecutionPackageReadAdapter;
};

export type UseGovernedClinicalExecutionPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalExecutionPackageResult | null;
  refresh: () => void;
};

export function useGovernedClinicalExecutionPackage(
  options: UseGovernedClinicalExecutionPackageOptions,
): UseGovernedClinicalExecutionPackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalExecutionPackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalExecutionPackageResult | null>(null);
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
      .getGovernedClinicalExecutionPackage(sessionId)
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
