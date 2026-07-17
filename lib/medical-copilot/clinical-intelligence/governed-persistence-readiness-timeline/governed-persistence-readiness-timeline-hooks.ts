"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessTimelineReadAdapter,
  type GovernedPersistenceReadinessTimelineReadAdapter,
} from "./governed-persistence-readiness-timeline-adapter";
import type { GovernedPersistenceReadinessTimelineResult } from "./governed-persistence-readiness-timeline";

export type UseGovernedPersistenceReadinessTimelineOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessTimelineReadAdapter;
};

export type UseGovernedPersistenceReadinessTimelineResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessTimelineResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessTimeline(
  options: UseGovernedPersistenceReadinessTimelineOptions,
): UseGovernedPersistenceReadinessTimelineResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessTimelineReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessTimelineResult | null>(null);
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
      .getGovernedPersistenceReadinessTimeline(sessionId)
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
