"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalPersistenceOrchestratorReadAdapter,
  type GovernedClinicalPersistenceOrchestratorReadAdapter,
} from "./governed-clinical-persistence-orchestrator-adapter";
import type { GovernedClinicalPersistenceOrchestratorResult } from "./governed-clinical-persistence-orchestrator";

export type UseGovernedClinicalPersistenceOrchestratorOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalPersistenceOrchestratorReadAdapter;
};

export type UseGovernedClinicalPersistenceOrchestratorResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalPersistenceOrchestratorResult | null;
  refresh: () => void;
};

export function useGovernedClinicalPersistenceOrchestrator(
  options: UseGovernedClinicalPersistenceOrchestratorOptions,
): UseGovernedClinicalPersistenceOrchestratorResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalPersistenceOrchestratorReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalPersistenceOrchestratorResult | null>(null);
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
      .getGovernedClinicalPersistenceOrchestrator(sessionId)
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
