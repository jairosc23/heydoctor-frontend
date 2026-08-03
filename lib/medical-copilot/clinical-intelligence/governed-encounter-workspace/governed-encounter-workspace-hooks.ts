"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedEncounterWorkspaceReadAdapter,
  type GovernedEncounterWorkspaceReadAdapter,
} from "./governed-encounter-workspace-adapter";
import type { GovernedEncounterWorkspaceResult } from "./governed-encounter-workspace";

export type UseGovernedEncounterWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedEncounterWorkspaceReadAdapter;
};

export type UseGovernedEncounterWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedEncounterWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedEncounterWorkspace(
  options: UseGovernedEncounterWorkspaceOptions,
): UseGovernedEncounterWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedEncounterWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEncounterWorkspaceResult | null>(null);
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
      .getGovernedEncounterWorkspace(sessionId)
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
