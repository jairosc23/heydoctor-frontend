"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedEncounterTimelineReadAdapter,
  type GovernedEncounterTimelineReadAdapter,
} from "./governed-encounter-timeline-adapter";
import type { GovernedEncounterTimelineResult } from "./governed-encounter-timeline";

export type UseGovernedEncounterTimelineOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedEncounterTimelineReadAdapter;
};

export type UseGovernedEncounterTimelineResult = {
  loading: boolean;
  error: string | null;
  result: GovernedEncounterTimelineResult | null;
  refresh: () => void;
};

export function useGovernedEncounterTimeline(
  options: UseGovernedEncounterTimelineOptions,
): UseGovernedEncounterTimelineResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedEncounterTimelineReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEncounterTimelineResult | null>(null);
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
      .getGovernedEncounterTimeline(sessionId)
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
