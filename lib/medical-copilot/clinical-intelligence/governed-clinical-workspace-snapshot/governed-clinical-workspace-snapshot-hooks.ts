"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalWorkspaceSnapshotReadAdapter,
  type GovernedClinicalWorkspaceSnapshotReadAdapter,
} from "./governed-clinical-workspace-snapshot-adapter";
import type { GovernedClinicalWorkspaceSnapshotResult } from "./governed-clinical-workspace-snapshot";

export type UseGovernedClinicalWorkspaceSnapshotOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalWorkspaceSnapshotReadAdapter;
};

export type UseGovernedClinicalWorkspaceSnapshotResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalWorkspaceSnapshotResult | null;
  refresh: () => void;
};

export function useGovernedClinicalWorkspaceSnapshot(
  options: UseGovernedClinicalWorkspaceSnapshotOptions,
): UseGovernedClinicalWorkspaceSnapshotResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalWorkspaceSnapshotReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalWorkspaceSnapshotResult | null>(null);
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
      .getGovernedClinicalWorkspaceSnapshot(sessionId)
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
