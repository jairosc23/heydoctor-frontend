"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPhysicianInteractionWorkspaceReadAdapter,
  type GovernedPhysicianInteractionWorkspaceReadAdapter,
} from "./governed-physician-interaction-workspace-adapter";
import type { GovernedPhysicianInteractionWorkspaceResult } from "./governed-physician-interaction-workspace";

export type UseGovernedPhysicianInteractionWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianInteractionWorkspaceReadAdapter;
};

export type UseGovernedPhysicianInteractionWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianInteractionWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianInteractionWorkspace(
  options: UseGovernedPhysicianInteractionWorkspaceOptions,
): UseGovernedPhysicianInteractionWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPhysicianInteractionWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianInteractionWorkspaceResult | null>(null);
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
      .getGovernedPhysicianInteractionWorkspace(sessionId)
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
