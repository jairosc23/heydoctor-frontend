"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalTimelineReadAdapter,
  type GovernedClinicalTimelineReadAdapter,
} from "./governed-clinical-timeline-adapter";
import type { GovernedClinicalTimelineResult } from "./governed-clinical-timeline";

export type UseGovernedClinicalTimelineOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalTimelineReadAdapter;
};

export type UseGovernedClinicalTimelineResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalTimelineResult | null;
  refresh: () => void;
};

export function useGovernedClinicalTimeline(
  options: UseGovernedClinicalTimelineOptions,
): UseGovernedClinicalTimelineResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalTimelineReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalTimelineResult | null>(null);
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
      .getGovernedClinicalTimeline(sessionId)
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
