"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalPersistenceReadinessReadAdapter,
  type GovernedClinicalPersistenceReadinessReadAdapter,
} from "./governed-clinical-persistence-readiness-adapter";
import type { GovernedClinicalPersistenceReadinessResult } from "./governed-clinical-persistence-readiness";

export type UseGovernedClinicalPersistenceReadinessOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalPersistenceReadinessReadAdapter;
};

export type UseGovernedClinicalPersistenceReadinessResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalPersistenceReadinessResult | null;
  refresh: () => void;
};

export function useGovernedClinicalPersistenceReadiness(
  options: UseGovernedClinicalPersistenceReadinessOptions,
): UseGovernedClinicalPersistenceReadinessResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalPersistenceReadinessReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalPersistenceReadinessResult | null>(null);
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
      .getGovernedClinicalPersistenceReadiness(sessionId)
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
