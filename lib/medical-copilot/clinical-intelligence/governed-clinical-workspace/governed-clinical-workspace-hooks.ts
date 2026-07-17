"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalWorkspaceReadAdapter,
  type GovernedClinicalWorkspaceReadAdapter,
} from "./governed-clinical-workspace-adapter";
import type { GovernedClinicalWorkspaceResult } from "./governed-clinical-workspace";

export type UseGovernedClinicalWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalWorkspaceReadAdapter;
};

export type UseGovernedClinicalWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedClinicalWorkspace(
  options: UseGovernedClinicalWorkspaceOptions,
): UseGovernedClinicalWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalWorkspaceResult | null>(null);
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
      .getGovernedClinicalWorkspace(sessionId)
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
