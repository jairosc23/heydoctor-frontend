"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalActivationWorkspaceReadAdapter,
  type GovernedClinicalActivationWorkspaceReadAdapter,
} from "./governed-clinical-activation-workspace-adapter";
import type { GovernedClinicalActivationWorkspaceResult } from "./governed-clinical-activation-workspace";

export type UseGovernedClinicalActivationWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalActivationWorkspaceReadAdapter;
};

export type UseGovernedClinicalActivationWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalActivationWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedClinicalActivationWorkspace(
  options: UseGovernedClinicalActivationWorkspaceOptions,
): UseGovernedClinicalActivationWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalActivationWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActivationWorkspaceResult | null>(null);
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
      .getGovernedClinicalActivationWorkspace(sessionId)
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
