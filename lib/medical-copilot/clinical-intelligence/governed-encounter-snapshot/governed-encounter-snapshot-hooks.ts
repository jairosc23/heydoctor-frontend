"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedEncounterSnapshotReadAdapter,
  type GovernedEncounterSnapshotReadAdapter,
} from "./governed-encounter-snapshot-adapter";
import type { GovernedEncounterSnapshotResult } from "./governed-encounter-snapshot";

export type UseGovernedEncounterSnapshotOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedEncounterSnapshotReadAdapter;
};

export type UseGovernedEncounterSnapshotResult = {
  loading: boolean;
  error: string | null;
  result: GovernedEncounterSnapshotResult | null;
  refresh: () => void;
};

export function useGovernedEncounterSnapshot(
  options: UseGovernedEncounterSnapshotOptions,
): UseGovernedEncounterSnapshotResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedEncounterSnapshotReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEncounterSnapshotResult | null>(null);
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
      .getGovernedEncounterSnapshot(sessionId)
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
