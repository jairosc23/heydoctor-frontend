"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalValidationPackageReadAdapter,
  type GovernedClinicalValidationPackageReadAdapter,
} from "./governed-clinical-validation-package-adapter";
import type { GovernedClinicalValidationPackageResult } from "./governed-clinical-validation-package";

export type UseGovernedClinicalValidationPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalValidationPackageReadAdapter;
};

export type UseGovernedClinicalValidationPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalValidationPackageResult | null;
  refresh: () => void;
};

export function useGovernedClinicalValidationPackage(
  options: UseGovernedClinicalValidationPackageOptions,
): UseGovernedClinicalValidationPackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalValidationPackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalValidationPackageResult | null>(null);
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
      .getGovernedClinicalValidationPackage(sessionId)
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
