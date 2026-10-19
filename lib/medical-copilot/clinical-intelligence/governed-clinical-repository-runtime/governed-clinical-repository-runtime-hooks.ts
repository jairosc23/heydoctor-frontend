"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalRepositoryRuntimeReadAdapter,
  type GovernedClinicalRepositoryRuntimeReadAdapter,
} from "./governed-clinical-repository-runtime-adapter";
import type { GovernedClinicalRepositoryRuntimeResult } from "./governed-clinical-repository-runtime";

export type UseGovernedClinicalRepositoryRuntimeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalRepositoryRuntimeReadAdapter;
};

export type UseGovernedClinicalRepositoryRuntimeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalRepositoryRuntimeResult | null;
  refresh: () => void;
};

export function useGovernedClinicalRepositoryRuntime(
  options: UseGovernedClinicalRepositoryRuntimeOptions,
): UseGovernedClinicalRepositoryRuntimeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalRepositoryRuntimeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedClinicalRepositoryRuntimeResult | null>(null);
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
      .getGovernedClinicalRepositoryRuntime(sessionId)
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
