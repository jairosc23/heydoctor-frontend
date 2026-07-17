"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalWorkspaceConsolidationReadAdapter,
  type GovernedClinicalWorkspaceConsolidationReadAdapter,
} from "./governed-clinical-workspace-consolidation-adapter";
import type { GovernedClinicalWorkspaceConsolidationResult } from "./governed-clinical-workspace-consolidation";

export type UseGovernedClinicalWorkspaceConsolidationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalWorkspaceConsolidationReadAdapter;
};

export type UseGovernedClinicalWorkspaceConsolidationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalWorkspaceConsolidationResult | null;
  refresh: () => void;
};

export function useGovernedClinicalWorkspaceConsolidation(
  options: UseGovernedClinicalWorkspaceConsolidationOptions,
): UseGovernedClinicalWorkspaceConsolidationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalWorkspaceConsolidationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalWorkspaceConsolidationResult | null>(null);
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
      .getGovernedClinicalWorkspaceConsolidation(sessionId)
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
