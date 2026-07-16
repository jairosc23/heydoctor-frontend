"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedEncounterConsolidationReadAdapter,
  type GovernedEncounterConsolidationReadAdapter,
} from "./governed-encounter-consolidation-adapter";
import type { GovernedEncounterConsolidationResult } from "./governed-encounter-consolidation";

export type UseGovernedEncounterConsolidationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedEncounterConsolidationReadAdapter;
};

export type UseGovernedEncounterConsolidationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedEncounterConsolidationResult | null;
  refresh: () => void;
};

export function useGovernedEncounterConsolidation(
  options: UseGovernedEncounterConsolidationOptions,
): UseGovernedEncounterConsolidationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedEncounterConsolidationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEncounterConsolidationResult | null>(null);
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
      .getGovernedEncounterConsolidation(sessionId)
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
