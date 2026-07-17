"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationWorkspaceReadAdapter,
  type GovernedConsultationWorkspaceReadAdapter,
} from "./governed-consultation-workspace-adapter";
import type { GovernedConsultationWorkspaceResult } from "./governed-consultation-workspace";

export type UseGovernedConsultationWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationWorkspaceReadAdapter;
};

export type UseGovernedConsultationWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedConsultationWorkspace(
  options: UseGovernedConsultationWorkspaceOptions,
): UseGovernedConsultationWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationWorkspaceResult | null>(null);
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
      .getGovernedConsultationWorkspace(sessionId)
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
