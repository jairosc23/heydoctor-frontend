"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedValidationWorkspaceReadAdapter,
  type GovernedValidationWorkspaceReadAdapter,
} from "./governed-validation-workspace-adapter";
import type { GovernedValidationWorkspaceResult } from "./governed-validation-workspace";

export type UseGovernedValidationWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedValidationWorkspaceReadAdapter;
};

export type UseGovernedValidationWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedValidationWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedValidationWorkspace(
  options: UseGovernedValidationWorkspaceOptions,
): UseGovernedValidationWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedValidationWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedValidationWorkspaceResult | null>(null);
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
      .getGovernedValidationWorkspace(sessionId)
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
