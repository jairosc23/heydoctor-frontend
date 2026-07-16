"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalExperienceReadAdapter,
  type GovernedClinicalExperienceReadAdapter,
} from "./governed-clinical-experience-adapter";
import type { GovernedClinicalExperienceResult } from "./governed-clinical-experience";

export type UseGovernedClinicalExperienceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalExperienceReadAdapter;
};

export type UseGovernedClinicalExperienceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalExperienceResult | null;
  refresh: () => void;
};

export function useGovernedClinicalExperience(
  options: UseGovernedClinicalExperienceOptions,
): UseGovernedClinicalExperienceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalExperienceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalExperienceResult | null>(null);
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
      .getGovernedClinicalExperience(sessionId)
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
