"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceValidationReadAdapter,
  type GovernedPersistenceValidationReadAdapter,
} from "./governed-persistence-validation-adapter";
import type { GovernedPersistenceValidationResult } from "./governed-persistence-validation";

export type UseGovernedPersistenceValidationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceValidationReadAdapter;
};

export type UseGovernedPersistenceValidationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceValidationResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceValidation(
  options: UseGovernedPersistenceValidationOptions,
): UseGovernedPersistenceValidationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceValidationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceValidationResult | null>(null);
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
      .getGovernedPersistenceValidation(sessionId)
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
