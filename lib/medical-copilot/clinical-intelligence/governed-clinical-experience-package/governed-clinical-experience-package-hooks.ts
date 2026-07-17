"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalExperiencePackageReadAdapter,
  type GovernedClinicalExperiencePackageReadAdapter,
} from "./governed-clinical-experience-package-adapter";
import type { GovernedClinicalExperiencePackageResult } from "./governed-clinical-experience-package";

export type UseGovernedClinicalExperiencePackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalExperiencePackageReadAdapter;
};

export type UseGovernedClinicalExperiencePackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalExperiencePackageResult | null;
  refresh: () => void;
};

export function useGovernedClinicalExperiencePackage(
  options: UseGovernedClinicalExperiencePackageOptions,
): UseGovernedClinicalExperiencePackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalExperiencePackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalExperiencePackageResult | null>(null);
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
      .getGovernedClinicalExperiencePackage(sessionId)
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
