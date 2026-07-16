"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalPersistenceRuntimeStateReadAdapter,
  type GovernedClinicalPersistenceRuntimeStateReadAdapter,
} from "./governed-clinical-persistence-runtime-state-adapter";
import type { GovernedClinicalPersistenceRuntimeStateResult } from "./governed-clinical-persistence-runtime-state";

export type UseGovernedClinicalPersistenceRuntimeStateOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalPersistenceRuntimeStateReadAdapter;
};

export type UseGovernedClinicalPersistenceRuntimeStateResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalPersistenceRuntimeStateResult | null;
  refresh: () => void;
};

export function useGovernedClinicalPersistenceRuntimeState(
  options: UseGovernedClinicalPersistenceRuntimeStateOptions,
): UseGovernedClinicalPersistenceRuntimeStateResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalPersistenceRuntimeStateReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedClinicalPersistenceRuntimeStateResult | null>(null);
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
      .getGovernedClinicalPersistenceRuntimeState(sessionId)
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
