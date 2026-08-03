"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPhysicianActivationWorkspaceReadAdapter,
  type GovernedPhysicianActivationWorkspaceReadAdapter,
} from "./governed-physician-activation-workspace-adapter";
import type { GovernedPhysicianActivationWorkspaceResult } from "./governed-physician-activation-workspace";

export type UseGovernedPhysicianActivationWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianActivationWorkspaceReadAdapter;
};

export type UseGovernedPhysicianActivationWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianActivationWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianActivationWorkspace(
  options: UseGovernedPhysicianActivationWorkspaceOptions,
): UseGovernedPhysicianActivationWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPhysicianActivationWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianActivationWorkspaceResult | null>(null);
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
      .getGovernedPhysicianActivationWorkspace(sessionId)
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
