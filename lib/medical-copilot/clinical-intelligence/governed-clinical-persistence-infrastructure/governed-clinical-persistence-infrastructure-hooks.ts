"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalPersistenceInfrastructureReadAdapter,
  type GovernedClinicalPersistenceInfrastructureReadAdapter,
} from "./governed-clinical-persistence-infrastructure-adapter";
import type { GovernedClinicalPersistenceInfrastructureResult } from "./governed-clinical-persistence-infrastructure";

export type UseGovernedClinicalPersistenceInfrastructureOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalPersistenceInfrastructureReadAdapter;
};

export type UseGovernedClinicalPersistenceInfrastructureResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalPersistenceInfrastructureResult | null;
  refresh: () => void;
};

export function useGovernedClinicalPersistenceInfrastructure(
  options: UseGovernedClinicalPersistenceInfrastructureOptions,
): UseGovernedClinicalPersistenceInfrastructureResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalPersistenceInfrastructureReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedClinicalPersistenceInfrastructureResult | null>(null);
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
      .getGovernedClinicalPersistenceInfrastructure(sessionId)
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
