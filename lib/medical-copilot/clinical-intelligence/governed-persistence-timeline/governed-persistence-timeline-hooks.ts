"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceTimelineReadAdapter,
  type GovernedPersistenceTimelineReadAdapter,
} from "./governed-persistence-timeline-adapter";
import type { GovernedPersistenceTimelineResult } from "./governed-persistence-timeline";

export type UseGovernedPersistenceTimelineOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceTimelineReadAdapter;
};

export type UseGovernedPersistenceTimelineResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceTimelineResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceTimeline(
  options: UseGovernedPersistenceTimelineOptions,
): UseGovernedPersistenceTimelineResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceTimelineReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceTimelineResult | null>(null);
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
      .getGovernedPersistenceTimeline(sessionId)
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
