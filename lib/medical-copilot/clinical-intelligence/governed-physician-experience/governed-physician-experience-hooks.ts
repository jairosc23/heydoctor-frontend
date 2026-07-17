"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPhysicianExperienceReadAdapter,
  type GovernedPhysicianExperienceReadAdapter,
} from "./governed-physician-experience-adapter";
import type { GovernedPhysicianExperienceResult } from "./governed-physician-experience";

export type UseGovernedPhysicianExperienceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianExperienceReadAdapter;
};

export type UseGovernedPhysicianExperienceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianExperienceResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianExperience(
  options: UseGovernedPhysicianExperienceOptions,
): UseGovernedPhysicianExperienceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPhysicianExperienceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianExperienceResult | null>(null);
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
      .getGovernedPhysicianExperience(sessionId)
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
