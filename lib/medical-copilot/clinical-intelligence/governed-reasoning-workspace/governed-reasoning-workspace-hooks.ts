"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedReasoningReadAdapter, type GovernedReasoningWorkspaceReadAdapter } from "./governed-reasoning-workspace-adapter";
import type { GovernedReasoningWorkspaceBuilderResult } from "./governed-reasoning-workspace";

export type UseGovernedReasoningWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedReasoningWorkspaceReadAdapter;
};
export type UseGovernedReasoningWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedReasoningWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useGovernedReasoningWorkspace(options: UseGovernedReasoningWorkspaceOptions): UseGovernedReasoningWorkspaceResult {
  const { sessionId, enabled = true, adapter = governedReasoningReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReasoningWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReasoningWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
