"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessValidationReadAdapter,
  type GovernedPersistenceReadinessValidationReadAdapter,
} from "./governed-persistence-readiness-validation-adapter";
import type { GovernedPersistenceReadinessValidationResult } from "./governed-persistence-readiness-validation";

export type UseGovernedPersistenceReadinessValidationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessValidationReadAdapter;
};

export type UseGovernedPersistenceReadinessValidationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessValidationResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessValidation(
  options: UseGovernedPersistenceReadinessValidationOptions,
): UseGovernedPersistenceReadinessValidationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessValidationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessValidationResult | null>(null);
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
      .getGovernedPersistenceReadinessValidation(sessionId)
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
