"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessPackageReadAdapter,
  type GovernedPersistenceReadinessPackageReadAdapter,
} from "./governed-persistence-readiness-package-adapter";
import type { GovernedPersistenceReadinessPackageResult } from "./governed-persistence-readiness-package";

export type UseGovernedPersistenceReadinessPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessPackageReadAdapter;
};

export type UseGovernedPersistenceReadinessPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessPackageResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessPackage(
  options: UseGovernedPersistenceReadinessPackageOptions,
): UseGovernedPersistenceReadinessPackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessPackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessPackageResult | null>(null);
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
      .getGovernedPersistenceReadinessPackage(sessionId)
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
