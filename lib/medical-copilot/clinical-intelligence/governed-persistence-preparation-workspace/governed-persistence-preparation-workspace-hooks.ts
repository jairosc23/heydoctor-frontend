"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistencePreparationWorkspaceReadAdapter,
  type GovernedPersistencePreparationWorkspaceReadAdapter,
} from "./governed-persistence-preparation-workspace-adapter";
import type { GovernedPersistencePreparationWorkspaceResult } from "./governed-persistence-preparation-workspace";

export type UseGovernedPersistencePreparationWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistencePreparationWorkspaceReadAdapter;
};

export type UseGovernedPersistencePreparationWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistencePreparationWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedPersistencePreparationWorkspace(
  options: UseGovernedPersistencePreparationWorkspaceOptions,
): UseGovernedPersistencePreparationWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistencePreparationWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistencePreparationWorkspaceResult | null>(null);
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
      .getGovernedPersistencePreparationWorkspace(sessionId)
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
