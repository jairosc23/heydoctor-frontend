"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalActivationTimelineReadAdapter,
  type GovernedClinicalActivationTimelineReadAdapter,
} from "./governed-clinical-activation-timeline-adapter";
import type { GovernedClinicalActivationTimelineResult } from "./governed-clinical-activation-timeline";

export type UseGovernedClinicalActivationTimelineOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalActivationTimelineReadAdapter;
};

export type UseGovernedClinicalActivationTimelineResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalActivationTimelineResult | null;
  refresh: () => void;
};

export function useGovernedClinicalActivationTimeline(
  options: UseGovernedClinicalActivationTimelineOptions,
): UseGovernedClinicalActivationTimelineResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalActivationTimelineReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActivationTimelineResult | null>(null);
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
      .getGovernedClinicalActivationTimeline(sessionId)
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
