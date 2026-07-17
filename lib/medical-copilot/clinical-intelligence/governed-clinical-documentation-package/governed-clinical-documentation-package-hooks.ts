"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalDocumentationPackageReadAdapter,
  type GovernedClinicalDocumentationPackageReadAdapter,
} from "./governed-clinical-documentation-package-adapter";
import type { GovernedClinicalDocumentationPackageResult } from "./governed-clinical-documentation-package";

export type UseGovernedClinicalDocumentationPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalDocumentationPackageReadAdapter;
};

export type UseGovernedClinicalDocumentationPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalDocumentationPackageResult | null;
  refresh: () => void;
};

export function useGovernedClinicalDocumentationPackage(
  options: UseGovernedClinicalDocumentationPackageOptions,
): UseGovernedClinicalDocumentationPackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalDocumentationPackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedClinicalDocumentationPackageResult | null>(null);
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
      .getGovernedClinicalDocumentationPackage(sessionId)
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
