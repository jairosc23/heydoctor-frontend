"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPhysicianWorkspaceReadAdapter,
  type GovernedPhysicianWorkspaceReadAdapter,
} from "./governed-physician-workspace-adapter";
import type { GovernedPhysicianWorkspaceResult } from "./governed-physician-workspace";

export type UseGovernedPhysicianWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianWorkspaceReadAdapter;
};

export type UseGovernedPhysicianWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianWorkspace(
  options: UseGovernedPhysicianWorkspaceOptions,
): UseGovernedPhysicianWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPhysicianWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianWorkspaceResult | null>(null);
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
      .getGovernedPhysicianWorkspace(sessionId)
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
