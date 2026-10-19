"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalEncounterReadAdapter,
  type GovernedClinicalEncounterReadAdapter,
} from "./governed-clinical-encounter-adapter";
import type { GovernedClinicalEncounterResult } from "./governed-clinical-encounter";

export type UseGovernedClinicalEncounterOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalEncounterReadAdapter;
};

export type UseGovernedClinicalEncounterResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalEncounterResult | null;
  refresh: () => void;
};

export function useGovernedClinicalEncounter(
  options: UseGovernedClinicalEncounterOptions,
): UseGovernedClinicalEncounterResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalEncounterReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalEncounterResult | null>(
    null,
  );
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
      .getGovernedClinicalEncounter(sessionId)
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
