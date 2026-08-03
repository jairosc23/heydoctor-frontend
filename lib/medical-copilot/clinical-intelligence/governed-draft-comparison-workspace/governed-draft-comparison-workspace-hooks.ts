"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedDraftComparisonWorkspaceReadAdapter,
  type GovernedDraftComparisonWorkspaceReadAdapter,
} from "./governed-draft-comparison-workspace-adapter";
import type { GovernedDraftComparisonWorkspaceResult } from "./governed-draft-comparison-workspace";

export type UseGovernedDraftComparisonWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedDraftComparisonWorkspaceReadAdapter;
};

export type UseGovernedDraftComparisonWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedDraftComparisonWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedDraftComparisonWorkspace(
  options: UseGovernedDraftComparisonWorkspaceOptions,
): UseGovernedDraftComparisonWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedDraftComparisonWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDraftComparisonWorkspaceResult | null>(null);
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
      .getGovernedDraftComparisonWorkspace(sessionId)
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
